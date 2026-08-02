from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import datetime

from app import models, schemas, auth
from app.database import get_db
from app.services.weather_service import WeatherService
from app.ml.insights_generator import InsightsGenerator

router = APIRouter(
    prefix="/weather",
    tags=["Weather & Farming Insights"]
)

@router.get("", response_model=schemas.WeatherAdviceResponse)
def get_weather_and_advice(
    lat: float = Query(28.61, description="Latitude coordinates"),
    lon: float = Query(77.20, description="Longitude coordinates"),
    crop: Optional[str] = Query("Rice", description="Current target crop"),
    soil_n: Optional[float] = Query(50.0, description="Current soil nitrogen level"),
    soil_p: Optional[float] = Query(45.0, description="Current soil phosphorus level"),
    soil_k: Optional[float] = Query(40.0, description="Current soil potassium level"),
    soil_ph: Optional[float] = Query(6.5, description="Current soil pH level"),
    db: Session = Depends(get_db)
):
    """
    Get weather telemetry forecasts, and generate AI insights/advice based on soil NPK levels and weather parameters.
    """
    try:
        import json
        from app.services.redis_service import RedisService
        
        # 1. Check Redis Cache first
        redis_key = f"weather_cache:{round(lat, 2)}:{round(lon, 2)}"
        cached_redis = RedisService.get(redis_key)
        weather_data = None
        if cached_redis:
            try:
                weather_data = json.loads(cached_redis)
            except Exception:
                weather_data = None
                
        if not weather_data:
            # 2. Check DB Cache
            cache_time_threshold = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=2)
            cached = db.query(models.WeatherCache).filter(
                models.WeatherCache.lat == round(lat, 2),
                models.WeatherCache.lon == round(lon, 2),
                models.WeatherCache.fetched_at > cache_time_threshold
            ).first()
            
            if cached:
                weather_data = cached.data
                # Update Redis
                try:
                    RedisService.set(redis_key, json.dumps(weather_data), ex=7200) # cache for 2 hours
                except Exception:
                    pass
            else:
                # 3. Call API
                weather_data = WeatherService.get_weather(lat, lon)
                # Save DB Cache
                db_cache = models.WeatherCache(
                    lat=round(lat, 2),
                    lon=round(lon, 2),
                    data=weather_data
                )
                db.add(db_cache)
                db.commit()
                # Save Redis Cache
                try:
                    RedisService.set(redis_key, json.dumps(weather_data), ex=7200)
                except Exception:
                    pass
            
        # Combine with insights generator
        soil_data = {
            "N": soil_n,
            "P": soil_p,
            "K": soil_k,
            "pH": soil_ph
        }
        
        insights = InsightsGenerator.generate_insights(
            weather_data=weather_data,
            soil_data=soil_data,
            crop=crop
        )
        
        return {
            "weather": weather_data,
            "farming_advice": insights
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch weather and compute insights: {str(e)}"
        )
