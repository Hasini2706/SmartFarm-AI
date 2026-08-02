from typing import List, Dict, Any

class InsightsGenerator:
    @staticmethod
    def generate_insights(weather_data: Dict[str, Any], soil_data: Dict[str, float], crop: str) -> List[str]:
        """
        Generates AI farm insights based on current weather, soil, and crop type.
        """
        insights = []
        
        # Weather-based insights
        rain_prob = weather_data.get("rain_probability", 0.0)
        temp = weather_data.get("temperature", 25.0)
        humidity = weather_data.get("humidity", 60.0)
        condition = weather_data.get("condition", "Sunny").lower()
        
        if rain_prob > 70 or "rain" in condition:
            insights.append("Rain expected soon. Delay planned irrigation to prevent waterlogging and conserve water.")
            insights.append("Postpone foliar pesticide or fertilizer sprays to prevent chemical wash-off.")
        elif rain_prob > 40 and rain_prob <= 70:
            insights.append("Moderate rain probability. Monitor forecast before triggering high-volume irrigation.")
            
        if temp > 35:
            insights.append(f"High heat wave detected ({temp}°C). Apply mulching to retain soil moisture and prevent root baking.")
            insights.append("Water early in the morning or late evening to minimize transpiration losses.")
        elif temp < 15:
            insights.append(f"Cool temperatures detected ({temp}°C). Sowing germination rates may slow down. Avoid water saturation.")
            
        if humidity > 85:
            insights.append(f"Excessive air humidity detected ({humidity}%). Conditions are highly conducive for fungal spore propagation.")
            if crop.lower() in ["cotton", "potato", "tomato"]:
                insights.append(f"Fungal Alert: {crop} crops may suffer leaf spot or blight infections. Inspect lower leaves.")
                
        # Soil nutrient-based insights
        n = soil_data.get("N", 50.0)
        p = soil_data.get("P", 40.0)
        k = soil_data.get("K", 40.0)
        ph = soil_data.get("pH", 6.5)
        
        if n > 120:
            insights.append("High Nitrogen detected in soil. Excess nitrogen can lead to watery vegetative growth, attracting sucking pests (like aphids) and increasing susceptibility to blast disease.")
        elif n < 30:
            insights.append("Critically low Nitrogen. Leaf yellowing (chlorosis) may occur. Top-dress with Urea or apply organic manure.")
            
        if p < 20:
            insights.append("Phosphorus levels are deficient. Root development and early tillering could be stunted. Apply a phosphate fertilizer.")
            
        if k < 25:
            insights.append("Potassium levels are low. Stalk strength and grain filling may be impaired, reducing drought tolerance. Apply Muriate of Potash.")
            
        if ph < 5.5:
            insights.append(f"Soil pH is strongly acidic ({ph}). Nutrient uptake (especially P and K) will be restricted. Consider applying agricultural lime.")
        elif ph > 7.8:
            insights.append(f"Soil pH is alkaline ({ph}). Iron, Zinc, and Manganese deficiencies may occur. Apply organic compost or gypsum to correct pH.")
            
        # Default insights if not enough specific data
        if len(insights) < 2:
            insights.append("Soil and weather telemetry are in optimal ranges. Continue standard crop care cycle.")
            insights.append("Conduct visual scouting for weed competition near newly sprouted crops.")
            
        return insights
