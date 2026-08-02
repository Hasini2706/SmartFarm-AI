import pytest
from fastapi.testclient import TestClient

def test_weather_endpoint_success(client: TestClient):
    response = client.get("/api/v1/weather?lat=28.61&lon=77.20&crop=Rice")
    assert response.status_code == 200
    data = response.json()
    assert "weather" in data
    assert "farming_advice" in data
    assert "temperature" in data["weather"]
    assert "forecast" in data["weather"]
    assert len(data["weather"]["forecast"]) == 5
    assert len(data["farming_advice"]) > 0
