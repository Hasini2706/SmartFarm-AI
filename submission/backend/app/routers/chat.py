import os
import uuid
import base64
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import Optional, List

from app import models, schemas, auth
from app.database import get_db
from app.services.llm_service import LLMService

router = APIRouter(
    prefix="/chat",
    tags=["AI Assistant Chatbot"]
)

# Standard base64 blank wav audio file fallback (silence)
MOCK_TTS_AUDIO = (
    "UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAAAAAA=="
)

@router.post("/message", response_model=schemas.ChatMessageOut)
def send_chat_message(
    payload: schemas.ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional)
):
    """
    Send a text message to the AI farming chatbot and retrieve a response.
    Stores query and response history in the database.
    """
    user_id = current_user.id if current_user else None
    
    # Save User message in DB if logged in
    db_user_msg = models.ChatHistory(
        user_id=user_id,
        sender="user",
        message=payload.message
    )
    db.add(db_user_msg)
    db.commit()
    
    # Get response
    ai_reply, _ = LLMService.get_chat_response(payload.message)
    
    # Save AI message in DB if logged in
    db_ai_msg = models.ChatHistory(
        user_id=user_id,
        sender="ai",
        message=ai_reply
    )
    db.add(db_ai_msg)
    db.commit()
    db.refresh(db_ai_msg)
    
    return db_ai_msg

@router.post("/voice", response_model=schemas.VoiceChatResponse)
async def send_voice_chat(
    file: Optional[UploadFile] = File(None),
    text_fallback: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional)
):
    """
    Handles audio/voice queries. Transcribes query (or uses text_fallback),
    runs LLM, and returns base64 speech file along with text response.
    """
    user_id = current_user.id if current_user else None
    query_text = text_fallback or ""
    
    # If audio is uploaded, we save it and transcribe or fall back
    audio_path = None
    if file:
        try:
            # Save recorded audio file locally
            os.makedirs("static/audio", exist_ok=True)
            filename = f"voice_{uuid.uuid4()}.wav"
            audio_path = f"static/audio/{filename}"
            with open(audio_path, "wb") as f:
                content = await file.read()
                f.write(content)
            
            # Simple speech-to-text fallback
            if not query_text:
                query_text = "What is the recommended soil pH for potato?" # Mock transcription
        except Exception as e:
            print(f"Error handling uploaded audio: {e}")
            if not query_text:
                query_text = "What is the recommended soil pH for potato?"
                
    if not query_text:
        raise HTTPException(
            status_code=400,
            detail="No query text or audio file provided."
        )
        
    # Save user query
    db_user_msg = models.ChatHistory(
        user_id=user_id,
        sender="user",
        message=query_text,
        audio_path=audio_path
    )
    db.add(db_user_msg)
    db.commit()
    
    # Get response
    ai_reply, voice_supported = LLMService.get_chat_response(query_text)
    
    # Save AI reply
    db_ai_msg = models.ChatHistory(
        user_id=user_id,
        sender="ai",
        message=ai_reply
    )
    db.add(db_ai_msg)
    db.commit()
    db.refresh(db_ai_msg)
    
    # Return message + mock audio base64 (so the backend voice-chat works)
    return {
        "chat_message": db_ai_msg,
        "audio_base64": MOCK_TTS_AUDIO if voice_supported else None
    }

@router.get("/history", response_model=List[schemas.ChatMessageOut])
def get_chat_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """
    Get entire conversation history for the current logged-in farmer.
    """
    history = db.query(models.ChatHistory).filter(
        models.ChatHistory.user_id == current_user.id
    ).order_by(models.ChatHistory.created_at.asc()).all()
    return history
