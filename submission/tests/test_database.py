import os
import sys
import pytest
from sqlalchemy.orm import Session

# Programmatically append backend/ to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app import models

def test_database_user_relationship(db_session: Session):
    # 1. Create a user
    user = models.User(
        email="test_db_user@smartfarm.ai",
        username="dbuser",
        hashed_password="hashed_dummy_password",
        full_name="Database Test User",
        role="farmer"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    assert user.id is not None
    
    # 2. Add prediction for this user
    prediction = models.Prediction(
        user_id=user.id,
        prediction_type="yield",
        input_data={"crop": "Corn", "area": 10},
        result_data={"predicted_yield": 4.5},
        confidence=0.92
    )
    db_session.add(prediction)
    db_session.commit()
    db_session.refresh(prediction)
    assert prediction.id is not None
    
    # 3. Add chat history entry
    chat = models.ChatHistory(
        user_id=user.id,
        sender="user",
        message="Help me with crop yields"
    )
    db_session.add(chat)
    db_session.commit()
    db_session.refresh(chat)
    assert chat.id is not None
    
    # 4. Verify relationships are correctly mapped
    db_user = db_session.query(models.User).filter(models.User.username == "dbuser").first()
    assert len(db_user.predictions) == 1
    assert db_user.predictions[0].prediction_type == "yield"
    assert len(db_user.chat_histories) == 1
    assert db_user.chat_histories[0].message == "Help me with crop yields"

def test_database_cascade_delete(db_session: Session):
    # Create user
    user = models.User(
        email="cascade@smartfarm.ai",
        username="cascadeuser",
        hashed_password="password123"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    # Add upload
    upload = models.Upload(
        user_id=user.id,
        filename="leaf.jpg",
        file_path="static/uploads/leaf.jpg",
        upload_type="disease"
    )
    db_session.add(upload)
    db_session.commit()
    
    # Verify insert
    assert db_session.query(models.Upload).filter(models.Upload.user_id == user.id).count() == 1
    
    # Delete user
    db_session.delete(user)
    db_session.commit()
    
    # Verify upload is cascade deleted
    assert db_session.query(models.Upload).filter(models.Upload.user_id == user.id).count() == 0
