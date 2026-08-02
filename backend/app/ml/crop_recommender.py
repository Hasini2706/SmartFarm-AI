import os
import pickle
import numpy as np
from typing import Dict, Any, List

class CropRecommender:
    def __init__(self):
        self.model = None
        self.classes = []
        self.model_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "models", "crop_recommendation_model.pkl")
        self.load_model()
        
    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, "rb") as f:
                    payload = pickle.load(f)
                    if isinstance(payload, dict) and 'model' in payload:
                        self.model = payload['model']
                        self.classes = list(payload['classes'])
                    else:
                        self.model = payload
                        self.classes = list(self.model.classes_)
                print("Crop recommendation model loaded successfully.")
            except Exception as e:
                print(f"Error loading crop recommendation model: {e}")
                self.setup_fallback()
        else:
            print("Crop recommendation model file not found. Setting up fallback.")
            self.setup_fallback()

    def setup_fallback(self):
        self.classes = ['Rice', 'Wheat', 'Corn', 'Cotton', 'Potato']
        self.model = None

    def predict(self, N: float, P: float, K: float, temperature: float, 
                humidity: float, rainfall: float, pH: float) -> List[Dict[str, Any]]:
        """
        Predicts top 5 crop recommendations based on soil NPK, pH, and weather inputs.
        """
        features = np.array([[N, P, K, temperature, humidity, rainfall, pH]])
        
        if self.model is not None:
            try:
                probs = self.model.predict_proba(features)[0]
                # Combine classes and probabilities
                recs = []
                for cls, prob in zip(self.classes, probs):
                    recs.append({"crop": cls, "probability": float(prob)})
                # Sort descending
                recs = sorted(recs, key=lambda x: x["probability"], reverse=True)
                return recs[:5]
            except Exception as e:
                print(f"Error during crop recommendation prediction: {e}")
                
        # Smart rule-based matching fallback
        crop_scores = {crop: 0.0 for crop in self.classes}
        crop_rules = {
            'Rice':     {'N': (70, 100), 'P': (40, 60),  'K': (35, 50),  'temp': (20, 30), 'hum': (80, 90), 'rain': (1500, 2500), 'ph': (5.5, 6.5)},
            'Wheat':    {'N': (60, 90),  'P': (35, 50),  'K': (30, 45),  'temp': (15, 23), 'hum': (50, 70), 'rain': (600, 1000),   'ph': (6.0, 7.5)},
            'Corn':     {'N': (80, 120), 'P': (45, 70),  'K': (40, 60),  'temp': (22, 32), 'hum': (60, 85), 'rain': (800, 1400),   'ph': (5.8, 7.0)},
            'Cotton':   {'N': (50, 80),  'P': (30, 50),  'K': (30, 50),  'temp': (25, 35), 'hum': (50, 80), 'rain': (500, 900),    'ph': (6.0, 8.0)},
            'Potato':   {'N': (90, 130), 'P': (60, 90),  'K': (100, 150), 'temp': (15, 22), 'hum': (70, 90), 'rain': (500, 800),    'ph': (5.0, 6.0)}
        }
        
        for crop, rules in crop_rules.items():
            score = 0.0
            # Calculate similarity score for each feature
            score += 1.0 - min(1.0, abs(N - np.mean(rules['N'])) / (np.std(rules['N']) or 15))
            score += 1.0 - min(1.0, abs(P - np.mean(rules['P'])) / (np.std(rules['P']) or 10))
            score += 1.0 - min(1.0, abs(K - np.mean(rules['K'])) / (np.std(rules['K']) or 20))
            score += 1.0 - min(1.0, abs(temperature - np.mean(rules['temp'])) / (np.std(rules['temp']) or 5))
            score += 1.0 - min(1.0, abs(humidity - np.mean(rules['hum'])) / (np.std(rules['hum']) or 10))
            score += 1.0 - min(1.0, abs(rainfall - np.mean(rules['rain'])) / (np.std(rules['rain']) or 300))
            score += 1.0 - min(1.0, abs(pH - np.mean(rules['ph'])) / (np.std(rules['ph']) or 0.5))
            
            crop_scores[crop] = max(0.01, score / 7.0)
            
        # Normalize scores to look like probabilities
        total = sum(crop_scores.values())
        recs = [{"crop": k, "probability": round(v / total, 3)} for k, v in crop_scores.items()]
        recs = sorted(recs, key=lambda x: x["probability"], reverse=True)
        return recs[:5]
