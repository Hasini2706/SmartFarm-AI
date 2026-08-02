import os
import pickle
import numpy as np
import pandas as pd
from typing import Dict, Any, List

class IrrigationPredictor:
    def __init__(self):
        self.model = None
        self.features = []
        self.model_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "models", "irrigation_model.pkl")
        self.load_model()
        
    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, "rb") as f:
                    payload = pickle.load(f)
                    self.model = payload['model']
                    self.features = payload['features']
                print("Irrigation model loaded successfully.")
            except Exception as e:
                print(f"Error loading irrigation model: {e}")
                self.model = None
        else:
            print("Irrigation model file not found.")
            self.model = None

    def predict(self, weather: str, soil_moisture: float, temperature: float, 
                humidity: float, crop_stage: str) -> Dict[str, Any]:
        """
        Predicts water requirement (L/m2), builds irrigation schedule, and lists warning messages.
        """
        # Form input features
        input_data = {
            'Soil_Moisture': soil_moisture,
            'Temperature': temperature,
            'Humidity': humidity,
            f"Weather_{weather}": 1.0,
            f"Crop_Stage_{crop_stage}": 1.0
        }
        
        # Build matching DataFrame
        df_in = pd.DataFrame([0.0] * len(self.features), index=self.features).T
        for k, v in input_data.items():
            if k in df_in.columns:
                df_in[k] = v
                
        # Predict water needed
        if self.model is not None:
            water_needed = float(self.model.predict(df_in)[0])
        else:
            # Fallback mathematical formulation
            base = 15.0
            weather_mult = {'Sunny': 1.4, 'Cloudy': 0.9, 'Rainy': 0.1}
            moisture_factor = max(0, 1.0 - (soil_moisture / 70.0))
            temp_factor = 1.0 + (temperature - 25) / 50.0
            stage_mult = {'Initial': 0.8, 'Mid': 1.5, 'Late': 1.0}
            
            water_needed = base * weather_mult.get(weather, 1.0) * moisture_factor * temp_factor * stage_mult.get(crop_stage, 1.0)
            water_needed = max(0.0, water_needed)
            
        # Determine Schedule
        if water_needed == 0:
            schedule = "No irrigation required today."
        elif weather == 'Rainy' or soil_moisture > 65:
            schedule = "Irrigation paused. Soil moisture is high / rain is present."
        elif soil_moisture < 25:
            schedule = "Immediate irrigation required. Apply water today."
        elif weather == 'Sunny' and temperature > 32:
            schedule = "Water daily in the early morning (before 8 AM) or late evening."
        else:
            schedule = "Water every 2 to 3 days."
            
        # Generate Warnings
        warnings = []
        if soil_moisture < 20:
            warnings.append("CRITICAL: Soil moisture is below wilting point (20%). Plant stress is imminent!")
        if temperature > 38:
            warnings.append("ALERT: Extremely high temperature detected. Increase water volume by 15% to compensate for evaporation.")
        if weather == 'Rainy':
            warnings.append("INFO: Rainfall detected. Turn off automated irrigation valves to save resources.")
        if humidity < 30:
            warnings.append("WARNING: Dry winds and low humidity. Transpiration rates are high.")
        if len(warnings) == 0:
            warnings.append("Normal conditions. Keep soil moisture at optimal levels.")
            
        return {
            'water_needed': round(water_needed, 2),
            'schedule': schedule,
            'warnings': warnings
        }
