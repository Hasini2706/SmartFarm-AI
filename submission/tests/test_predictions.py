import pytest
from fastapi.testclient import TestClient

def test_predict_yield_endpoint(client: TestClient):
    response = client.post("/api/v1/predictions/yield", json={
        "crop": "Wheat",
        "state": "Haryana",
        "area": 12.5,
        "rainfall": 820.0,
        "temperature": 24.5,
        "humidity": 60.0,
        "soil_type": "Alluvial",
        "season": "Rabi"
    })
    assert response.status_code == 200
    data = response.json()
    assert "predicted_yield" in data
    assert "predicted_production" in data
    assert "graph_data" in data
    assert len(data["graph_data"]) > 0

def test_predict_irrigation_endpoint(client: TestClient):
    response = client.post("/api/v1/predictions/irrigation", json={
        "weather": "Sunny",
        "soil_moisture": 35.5,
        "temperature": 32.0,
        "humidity": 50.0,
        "crop_stage": "Mid"
    })
    assert response.status_code == 200
    data = response.json()
    assert "water_needed" in data
    assert "schedule" in data
    assert "warnings" in data
    assert isinstance(data["warnings"], list)

def test_recommend_crops_endpoint(client: TestClient):
    response = client.post("/api/v1/crop/recommendation", json={
        "N": 80.0,
        "P": 45.0,
        "K": 40.0,
        "temperature": 25.0,
        "humidity": 75.0,
        "rainfall": 1200.0,
        "pH": 6.2
    })
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) == 5
    assert data["recommendations"][0]["crop"] in ["Rice", "Wheat", "Corn", "Cotton", "Potato"]

def test_recommend_fertilizer_endpoint(client: TestClient):
    response = client.post("/api/v1/crop/fertilizer", json={
        "soil_type": "Alluvial",
        "crop": "Rice",
        "N": 60.0,
        "P": 40.0,
        "K": 35.0
    })
    assert response.status_code == 200
    data = response.json()
    assert "recommended_fertilizer" in data
    assert "reasons" in data
    assert "application_tips" in data
