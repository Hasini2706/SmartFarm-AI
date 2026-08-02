import os
import pickle
import pandas as pd
import numpy as np
from typing import Dict, Any, List


FERTILIZER_METADATA = {
    'Urea': {
        'reasons': [
            'Highly deficient Nitrogen level detected relative to phosphorus and potassium.',
            'Target crop requires intensive nitrogen for leaf canopy growth.',
            'Soil structure shows good capacity to absorb nitrogen molecules.'
        ],
        'tips': [
            'Apply Urea in split doses: 1/3 at sowing, 1/3 at active tillering, and 1/3 at flowering.',
            'Incorporate it into the soil or apply prior to light rain/irrigation to avoid nitrogen volatilization loss.',
            'Do not mix Urea directly with acidic fertilizers.'
        ]
    },
    'DAP': {
        'reasons': [
            'High requirement of Phosphorus coupled with moderate Nitrogen requirement.',
            'Initial sowing stage requires active root stimulation.',
            'Soil report highlights critical phosphorus deficit.'
        ],
        'tips': [
            'Apply DAP at the time of sowing (basal application) near the seed zone.',
            'Place DAP 2-3 inches to the side and 2 inches below the seed to avoid seedling burn.',
            'Ensure the soil has optimal moisture for effective phosphorus release.'
        ]
    },
    'MOP': {
        'reasons': [
            'High Potassium deficit detected.',
            'Target crop is at bulking or fruiting stage which demands heavy potassium intake.',
            'Enhances water-use efficiency and disease resistance in dry/sandy soils.'
        ],
        'tips': [
            'Apply MOP (Muriate of Potash) in two splits for light/sandy soils to avoid leaching.',
            'Broadcast and mix thoroughly during final land preparation.',
            'Avoid placing MOP in direct contact with seeds.'
        ]
    },
    'NPK 19-19-19': {
        'reasons': [
            'Balanced deficit of Nitrogen, Phosphorus, and Potassium in the soil analysis.',
            'Target crop is in vegetative growth phase requiring equal nutrient distribution.',
            'Maintains general crop health and prevents secondary nutrient deficiencies.'
        ],
        'tips': [
            'Use as a foliar spray (dilute 10-15g per liter of water) for rapid absorption during active growth.',
            'Apply early morning or late afternoon when stomata are open.',
            'Can also be applied via drip fertigation systems.'
        ]
    },
    'SSP': {
        'reasons': [
            'Soil shows severe phosphorus deficit but nitrogen levels are adequate.',
            'SSP (Single Superphosphate) provides essential sulfur (11%) along with phosphorus (16%).',
            'Perfect for oilseeds, pulses, and tubers requiring high sulfur.'
        ],
        'tips': [
            'Apply as a basal dose during plowing.',
            'SSP is highly effective in neutral-to-alkaline soils to supply calcium and sulfur.',
            'Mix with organic manure before application to increase phosphorus availability.'
        ]
    },
    'Organic Compost': {
        'reasons': [
            'NPK levels are generally balanced, but soil organic carbon needs enrichment.',
            'Improves soil structure, water retention, and microbial activity.',
            'Low chemical footprint farming is preferred for this configuration.'
        ],
        'tips': [
            'Apply 5-10 tonnes of well-rotted farmyard manure (FYM) or vermicompost per acre.',
            'Mix thoroughly with topsoil 2-3 weeks before sowing.',
            'Combine with bio-fertilizers like Azotobacter or Phosphobacteria for superior results.'
        ]
    }
}

class FertilizerRecommender:
    def __init__(self):
        self.model = None
        self.features = []
        self.classes = []
        self.model_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "models", "fertilizer_model.pkl")
        self.load_model()
        
    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, "rb") as f:
                    payload = pickle.load(f)
                    self.model = payload['model']
                    self.features = payload['features']
                    self.classes = payload.get('classes', [])
                print("Fertilizer model loaded successfully.")
            except Exception as e:
                print(f"Error loading fertilizer model: {e}")
                self.model = None
        else:
            print("Fertilizer model file not found.")
            self.model = None

    def predict(self, soil_type: str, crop: str, N: float, P: float, K: float) -> Dict[str, Any]:
        """
        Recommends optimal fertilizer based on soil conditions.
        """
        # Create input dict
        input_data = {
            'N': N,
            'P': P,
            'K': K,
            f"Soil_Type_{soil_type}": 1.0,
            f"Crop_{crop}": 1.0
        }
        
        # Build DataFrame with all model features
        df_in = pd.DataFrame([0.0] * len(self.features), index=self.features).T
        for k, v in input_data.items():
            if k in df_in.columns:
                df_in[k] = v
                
        # Predict
        if self.model is not None:
            pred_val = self.model.predict(df_in)[0]
            if self.classes and isinstance(pred_val, (int, np.integer)):
                recommended_fertilizer = self.classes[int(pred_val)]
            else:
                recommended_fertilizer = str(pred_val)
        else:
            # Fallback heuristic rules
            if N < 40 and P > 50:
                recommended_fertilizer = 'DAP'
            elif N < 50 and K < 40:
                recommended_fertilizer = 'NPK 19-19-19'
            elif N > 100 and P < 40 and K < 40:
                recommended_fertilizer = 'Urea'
            elif K > 100 and N < 50:
                recommended_fertilizer = 'MOP'
            elif P < 30 and N < 30:
                recommended_fertilizer = 'SSP'
            else:
                recommended_fertilizer = 'Organic Compost'
                
        meta = FERTILIZER_METADATA.get(recommended_fertilizer, FERTILIZER_METADATA['Organic Compost'])
        
        return {
            'recommended_fertilizer': recommended_fertilizer,
            'reasons': meta['reasons'],
            'application_tips': meta['tips']
        }
