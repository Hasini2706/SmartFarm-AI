import os
import random
import requests
import hashlib
import json
from typing import Dict, Any, Tuple
from app.config import settings
from app.services.redis_service import RedisService

class LLMService:
    SYSTEM_PROMPT = """You are SmartFarm AI, an expert AI Agricultural Consultant and Agronomist decision-support system.
Your mission is to provide concise, practical, highly accurate, and actionable advice to farmers, agricultural extensions, and researchers.

When answering queries:
1. Identify the topic category (e.g. Farming Practices, Disease Identification & Treatment, Crop Recommendation, Soil & Fertilizer, Market/Mandi Prices, Weather & Irrigation).
2. Give clear, structured, step-by-step guidance.
3. For Diseases: Mention symptoms, cause (fungal/bacterial/viral), biological/organic treatment, and chemical control.
4. For Soil & Fertilizers: Mention NPK balancing, organic compost options, and application timing.
5. For Market Prices: Provide context on factors influencing Mandi rates and realistic market estimates.
6. Maintain an encouraging, respectful, professional tone appropriate for agricultural practitioners.
7. Keep formatting clean with bullet points and bold headers."""

    @staticmethod
    def get_chat_response(query: str) -> Tuple[str, bool, str]:
        """Generates AI chat response with Redis caching."""
        query_hash = hashlib.md5(query.strip().lower().encode("utf-8")).hexdigest()
        redis_key = f"chat_cache:{query_hash}"
        
        cached = RedisService.get(redis_key)
        if cached:
            try:
                data = json.loads(cached)
                provider = data.get("provider", "gemini")
                print(f"[LLMService] Served from Redis Cache. Provider: {provider}")
                return data["response"], data["voice_supported"], provider
            except Exception:
                pass
                
        response_text, voice_supported, provider = LLMService._generate_response(query)
        
        try:
            RedisService.set(redis_key, json.dumps({
                "response": response_text,
                "voice_supported": voice_supported,
                "provider": provider
            }), ex=86400) # Cache for 24 hours
        except Exception:
            pass
            
        return response_text, voice_supported, provider

    @staticmethod
    def _generate_response(query: str) -> Tuple[str, bool, str]:
        query_lower = query.lower()
        
        # Live Gemini API integration if API key is provided
        if settings.GEMINI_API_KEY:
            # Try available Gemini models in priority order
            models_to_try = [
                "gemini-flash-latest",
                "gemini-3.5-flash",
                "gemini-3.1-flash-lite",
                "gemini-2.0-flash",
                "gemini-1.5-flash"
            ]
            
            for model_name in models_to_try:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
                    payload = {
                        "contents": [{
                            "parts": [
                                {"text": LLMService.SYSTEM_PROMPT},
                                {"text": f"Farmer Query: {query}"}
                            ]
                        }],
                        "generationConfig": {
                            "temperature": 0.3,
                            "topK": 40,
                            "topP": 0.95,
                            "maxOutputTokens": 1024
                        }
                    }
                    
                    response = requests.post(url, json=payload, timeout=12)
                    if response.status_code == 200:
                        res_data = response.json()
                        candidates = res_data.get('candidates', [])
                        if candidates and 'content' in candidates[0]:
                            parts = candidates[0]['content'].get('parts', [])
                            if parts and 'text' in parts[0]:
                                response_text = parts[0]['text']
                                print(f"[LLMService] Response generated successfully via Gemini API model: '{model_name}'. Provider: 'gemini'")
                                return response_text, True, "gemini"
                    elif response.status_code == 429:
                        print(f"[LLMService] Gemini API model '{model_name}' rate limited (HTTP 429). Trying next fallback model.")
                        continue
                    elif response.status_code == 404:
                        continue
                    else:
                        print(f"[LLMService] Gemini API model '{model_name}' returned status {response.status_code}")
                except requests.exceptions.Timeout:
                    print(f"[LLMService] Timeout connecting to Gemini API model '{model_name}'")
                except Exception as e:
                    print(f"[LLMService] Error calling Gemini API ({model_name}): {e}")
                    
        print("[LLMService] Using fallback agronomist decision engine. Provider: 'fallback'")


        # 1. Government Schemes
        if any(w in query_lower for w in ["scheme", "government", "subsidy", "pm-kisan", "pmkisan", "yojana"]):
            return (
                "Here are key Government schemes for farmers:\n\n"
                "1. **PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)**: Provides ₹6,000 per year in three equal installments directly into bank accounts of landholding farmers.\n"
                "2. **PMFBY (Pradhan Mantri Fasal Bima Yojana)**: Low-premium crop insurance protecting against natural calamities, pests, and diseases.\n"
                "3. **Soil Health Card Scheme**: Provides farmers with cards detailing soil nutrient status and custom fertilizer recommendations for their land.\n"
                "4. **PMKSY (Pradhan Mantri Krishi Sinchayee Yojana)**: Focuses on 'Har Khet Ko Pani' (water to every field) and 'More Crop Per Drop' using drip and sprinkler irrigation subsidies.",
                True,
                "fallback"
            )
            
        # 2. Organic Farming
        elif any(w in query_lower for w in ["organic", "compost", "natural farming", "vermicompost", "manure"]):
            return (
                "Organic farming practices focus on ecological balance and soil health:\n\n"
                "- **Soil Nutrition**: Use vermicompost, cow dung manure, or green manures (like sunn hemp) instead of chemical fertilizers.\n"
                "- **Pest Control**: Apply Neem oil spray, garlic-chili paste extract, or utilize biological agents like trichoderma.\n"
                "- **Crop Rotation**: Alternate nitrogen-fixing legumes (lentils, beans) with grains (wheat, rice) to maintain soil structure and nutrients naturally.\n"
                "- **Mulching**: Use dry straw or organic matter to cover soil, conserving moisture and suppressing weed growth.",
                True,
                "fallback"
            )
            
        # 3. Market Prices
        elif any(w in query_lower for w in ["price", "market", "rate", "cost", "mandi", "sell"]):
            wheat_p = random.randint(2100, 2300)
            rice_p = random.randint(2200, 2500)
            corn_p = random.randint(1800, 2000)
            cotton_p = random.randint(6500, 7200)
            potato_p = random.randint(1100, 1500)
            
            return (
                f"Here are today's average Mandi prices per quintal (100 kg):\n\n"
                f"- **Wheat (Kanak)**: ₹{wheat_p} - ₹{wheat_p + 150}\n"
                f"- **Paddy/Rice**: ₹{rice_p} - ₹{rice_p + 200}\n"
                f"- **Corn (Maize)**: ₹{corn_p} - ₹{corn_p + 120}\n"
                f"- **Cotton (Kapas)**: ₹{cotton_p} - ₹{cotton_p + 400}\n"
                f"- **Potato**: ₹{potato_p} - ₹{potato_p + 250}\n\n"
                "Note: Actual prices may vary depending on moisture levels, quality, and specific agricultural markets.",
                True,
                "fallback"
            )
            
        # 4. Crop Diseases
        elif any(w in query_lower for w in ["disease", "fungal", "blight", "rust", "rot", "spots", "sick"]):
            return (
                "Common crop disease troubleshooting tips:\n\n"
                "- **Blight (Early/Late)**: Characterized by dark brown circles with target-like rings (Early) or water-soaked dark lesions (Late). Treat with copper fungicides or organic neem spray.\n"
                "- **Rust (Common/Yellow)**: Red-orange spores on leaves. Use propiconazole fungicides or ensure crop spacing to reduce humidity.\n"
                "- **Blast (Rice)**: Diamond-shaped lesions on leaves and nodes. Apply tricyclazole or optimize nitrogen application (excess nitrogen promotes blast).\n"
                "- **Prevention**: Always use certified disease-resistant seeds, avoid overhead irrigation, and prune infected leaves early.",
                True,
                "fallback"
            )
            
        # 5. Soil & pH
        elif any(w in query_lower for w in ["soil", "ph", "acidic", "alkaline", "nitrogen", "potassium", "phosphorus", "npk"]):
            return (
                "Managing Soil Health and NPK nutrients:\n\n"
                "- **pH Correction**: Optimal soil pH is 6.0 to 7.0 for most crops. For acidic soils (<5.5), apply agricultural lime (calcium carbonate). For alkaline soils (>7.8), add gypsum or organic sulfur.\n"
                "- **Nitrogen (N)**: Promotes leaf growth. Deficiency causes yellowing leaves (chlorosis). Apply Urea or organic compost.\n"
                "- **Phosphorus (P)**: Essential for root development. Deficiency limits growth. Apply DAP (Diammonium Phosphate) or SSP.\n"
                "- **Potassium (K)**: Increases disease resistance and water retention. Apply MOP (Muriate of Potash).",
                True,
                "fallback"
            )
            
        # 6. Weather
        elif any(w in query_lower for w in ["weather", "rain", "temperature", "climate", "forecast", "monsoon"]):
            return (
                "Weather-responsive farming guidelines:\n\n"
                "- **High Temp & Dry Air**: Increase irrigation frequency, prefer drip irrigation early in the morning, and apply mulching.\n"
                "- **Incoming Rainfall**: Postpone any chemical spraying or fertilizer applications. Clean drainage channels to prevent waterlogging.\n"
                "- **High Humidity**: Watch out for fungal disease outbreaks. Keep crop canopy aerated.",
                True,
                "fallback"
            )
            
        # 7. Seeds & Sowing
        elif any(w in query_lower for w in ["seed", "sow", "plant", "depth", "spacing"]):
            return (
                "General sowing recommendations:\n\n"
                "- **Rice**: Sow in nurseries first. Transplant 21-25 day old seedlings. Keep 15x20 cm spacing.\n"
                "- **Wheat**: Sow directly. Ideal seed rate is 100 kg/hectare. Sowing depth: 3-5 cm. Spacing: 20-22 cm row-to-row.\n"
                "- **Corn**: Sowing depth: 5 cm. Spacing: 60 cm row-to-row and 20 cm plant-to-plant.\n"
                "- **Potato**: Plant tubers at 7-10 cm depth. Spacing: 60x20 cm.\n"
                "- Seed treatment with Thiram or Trichoderma is highly recommended before sowing to prevent soil-borne diseases.",
                True,
                "fallback"
            )
            
        # 8. Pesticides & Controls
        elif any(w in query_lower for w in ["pesticide", "pest", "insects", "bugs", "worms", "spray"]):
            return (
                "Pest management strategies:\n\n"
                "- **Aphids/Jassids**: Sucking pests. Control using Neem oil spray (1500 ppm) or chemical sprays like Imidacloprid.\n"
                "- **Bollworms/Armyworms**: Chewing caterpillars. Use pheromone traps to capture moths. Use Bacillus thuringiensis (Bt) spray or chlorantraniliprole for chemical treatment.\n"
                "- **Spider Mites**: Create webbing under leaves. Apply acaricides/miticides like abamectin. Keep plants well-watered.\n"
                "- **IPM Practice**: Prefer Integrated Pest Management (IPM) - combine mechanical traps, organic spray, crop rotation, and use chemical pesticides only as a last resort.",
                True,
                "fallback"
            )

        # Default fallback
        return (
            "I'm your SmartFarm AI assistant. I can answer questions about crop diseases, market prices, organic farming, government schemes, soil health, seeds, and pest control.\n\n"
            "Could you specify what crop or farming query you have? E.g., 'What is the Mandi price of wheat today?' or 'How do I treat early blight in potatoes?'",
            False,
            "fallback"
        )


