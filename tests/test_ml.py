import os
import sys
import pytest

# Programmatically append backend/ to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.ml.yield_predictor import YieldPredictor
from app.ml.crop_recommender import CropRecommender
from app.ml.fertilizer_recommender import FertilizerRecommender
from app.ml.irrigation_predictor import IrrigationPredictor
from app.ml.disease_classifier import DiseaseClassifier
from app.ml.pest_detector import PestDetector
from app.ml.insights_generator import InsightsGenerator

def test_ml_yield_predictor():
    predictor = YieldPredictor()
    # Test valid prediction
    res = predictor.predict(
        crop="Wheat", state="Punjab", area=10.0, rainfall=800.0,
        temperature=22.0, humidity=60.0, soil_type="Alluvial", season="Rabi"
    )
    assert "predicted_yield" in res
    assert "predicted_production" in res
    assert res["predicted_yield"] > 0

def test_ml_crop_recommender():
    recommender = CropRecommender()
    res = recommender.predict(
        N=90, P=42, K=43, temperature=24.0, humidity=80.0, rainfall=1200.0, pH=6.5
    )
    assert len(res) > 0
    assert "crop" in res[0]
    assert "probability" in res[0]

def test_ml_fertilizer_recommender():
    recommender = FertilizerRecommender()
    res = recommender.predict(
        soil_type="Black", crop="Cotton", N=50.0, P=30.0, K=30.0
    )
    assert "recommended_fertilizer" in res
    assert "reasons" in res

def test_ml_irrigation_predictor():
    predictor = IrrigationPredictor()
    res = predictor.predict(
        weather="Sunny", soil_moisture=30.0, temperature=30.0, humidity=50.0, crop_stage="Mid"
    )
    assert "water_needed" in res
    assert "schedule" in res
    assert res["water_needed"] >= 0

def test_insights_generator():
    weather_data = {
        "temperature": 32.0,
        "humidity": 65.0,
        "wind_speed": 12.0,
        "pressure": 1010.0,
        "rain_probability": 15.0,
        "condition": "Cloudy",
        "forecast": []
    }
    soil_data = {"N": 50, "P": 40, "K": 30, "pH": 6.5}
    insights = InsightsGenerator.generate_insights(weather_data, soil_data, "Rice")
    assert len(insights) > 0
    assert any("Rice" in i or "soil" in i.lower() or "weather" in i.lower() for i in insights)
