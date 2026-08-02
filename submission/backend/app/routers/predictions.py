from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List

from app import models, schemas, auth
from app.database import get_db
from app.ml.yield_predictor import YieldPredictor
from app.ml.irrigation_predictor import IrrigationPredictor

router = APIRouter(
    prefix="/predictions",
    tags=["Predictions & Forecasting"]
)

# Instantiate models
yield_model = YieldPredictor()
irrigation_model = IrrigationPredictor()

@router.post("/yield", response_model=schemas.YieldOutput)
def predict_yield(
    payload: schemas.YieldInput,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional)
):
    """
    Predict crop yield based on geographical, climate, and soil features.
    Saves the result history into the database if the user is authenticated.
    """
    try:
        prediction_res = yield_model.predict(
            crop=payload.crop,
            state=payload.state,
            area=payload.area,
            rainfall=payload.rainfall,
            temperature=payload.temperature,
            humidity=payload.humidity,
            soil_type=payload.soil_type,
            season=payload.season
        )
        
        # Save prediction history
        user_id = current_user.id if current_user else None
        db_pred = models.Prediction(
            user_id=user_id,
            prediction_type="yield",
            input_data=payload.dict(),
            result_data=prediction_res,
            confidence=prediction_res["confidence"]
        )
        db.add(db_pred)
        db.commit()
        
        return prediction_res
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Yield prediction inference error: {str(e)}"
        )

@router.post("/irrigation", response_model=schemas.IrrigationOutput)
def predict_irrigation(
    payload: schemas.IrrigationInput,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional)
):
    """
    Calculate water requirements (L/m2) and get irrigation schedules and warnings.
    """
    try:
        prediction_res = irrigation_model.predict(
            weather=payload.weather,
            soil_moisture=payload.soil_moisture,
            temperature=payload.temperature,
            humidity=payload.humidity,
            crop_stage=payload.crop_stage
        )
        
        # Save prediction history
        user_id = current_user.id if current_user else None
        db_pred = models.Prediction(
            user_id=user_id,
            prediction_type="irrigation",
            input_data=payload.dict(),
            result_data=prediction_res,
            confidence=None
        )
        db.add(db_pred)
        db.commit()
        
        return prediction_res
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Irrigation prediction error: {str(e)}"
        )
