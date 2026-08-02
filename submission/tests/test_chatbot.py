import pytest
from fastapi.testclient import TestClient

def test_send_chat_message_guest(client: TestClient):
    response = client.post("/api/v1/chat/message", json={
        "message": "What is the mandi price of wheat today?"
    })
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["sender"] == "ai"
    assert "Mandi" in data["message"] or "Wheat" in data["message"]

def test_send_voice_chat_guest(client: TestClient):
    response = client.post("/api/v1/chat/voice", data={
        "text_fallback": "How do I treat early blight in potatoes?"
    })
    assert response.status_code == 200
    data = response.json()
    assert "chat_message" in data
    assert "audio_base64" in data
    assert data["chat_message"]["sender"] == "ai"
    assert "Blight" in data["chat_message"]["message"] or "potato" in data["chat_message"]["message"].lower()

def test_chat_history_requires_auth(client: TestClient):
    response = client.get("/api/v1/chat/history")
    assert response.status_code == 401
