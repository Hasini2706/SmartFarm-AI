from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import datetime

from app import models, schemas, auth
from app.database import get_db

router = APIRouter(
    prefix="/analytics",
    tags=["Dashboard Analytics"]
)

@router.get("", response_model=schemas.DashboardData)
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional)
):
    """
    Retrieves statistical KPIs and timeseries data to render the dashboard charts.
    """
    try:
        user_id = current_user.id if current_user else None
        
        # Calculate real database counts
        # If user is logged in, filter by user. Otherwise show totals.
        diagnoses_query = db.query(models.DiseaseHistory)
        predictions_query = db.query(models.Prediction)
        
        if user_id:
            diagnoses_query = diagnoses_query.filter(models.DiseaseHistory.user_id == user_id)
            predictions_query = predictions_query.filter(models.Prediction.user_id == user_id)
            
        total_diagnoses = diagnoses_query.count()
        total_predictions = predictions_query.count()
        
        # Aggregate mock or database KPIs
        # Calculate mock water savings: each irrigation prediction saves a baseline amount
        irrigation_count = predictions_query.filter(models.Prediction.prediction_type == "irrigation").count()
        water_saved = float(irrigation_count * 250.0 + 3420.0) # default baseline + incremental
        
        # Yield averages
        yield_preds = predictions_query.filter(models.Prediction.prediction_type == "yield").all()
        if yield_preds:
            yield_vals = [p.result_data.get("predicted_yield", 2.5) for p in yield_preds]
            avg_yield = sum(yield_vals) / len(yield_vals)
        else:
            avg_yield = 3.65
            
        kpis = {
            "total_diagnoses": total_diagnoses,
            "total_predictions": total_predictions,
            "water_saved_liters": water_saved,
            "average_yield": round(avg_yield, 2)
        }
        
        # Yield trends (Historical crop performance chart)
        yield_trends = [
            {"year": 2021, "Rice": 3.8, "Wheat": 3.1, "Corn": 4.2, "Cotton": 1.2, "Potato": 18.5},
            {"year": 2022, "Rice": 4.0, "Wheat": 3.2, "Corn": 4.5, "Cotton": 1.1, "Potato": 19.2},
            {"year": 2023, "Rice": 4.1, "Wheat": 3.4, "Corn": 4.3, "Cotton": 1.3, "Potato": 19.8},
            {"year": 2024, "Rice": 4.3, "Wheat": 3.5, "Corn": 4.7, "Cotton": 1.4, "Potato": 20.4},
            {"year": 2025, "Rice": 4.5, "Wheat": 3.6, "Corn": 4.9, "Cotton": 1.5, "Potato": 21.2}
        ]
        
        # Disease distribution chart
        # Query counts from DB, fill up to realistic charts
        disease_counts = {}
        for d in diagnoses_query.all():
            disease_counts[d.disease_name] = disease_counts.get(d.disease_name, 0) + 1
            
        # Default distribution baseline for visuals
        disease_history = []
        default_diseases = {
            "Tomato Early Blight": 12,
            "Potato Late Blight": 8,
            "Corn Common Rust": 15,
            "Rice Brown Spot": 6,
            "Cotton Fungal Rot": 5
        }
        # Update default distributions with real user diagnoses
        for k, v in default_diseases.items():
            db_count = sum(val for name, val in disease_counts.items() if k.lower() in name.lower())
            disease_history.append({"disease": k, "cases": v + db_count})
            
        # Combine Recent Activities
        recent_activities = []
        
        # Add diagnoses
        recent_diagnoses = diagnoses_query.order_by(models.DiseaseHistory.created_at.desc()).limit(3).all()
        for rd in recent_diagnoses:
            recent_activities.append({
                "id": rd.id,
                "activity_type": "diagnosis",
                "description": f"Diagnosed {rd.crop_name} with {rd.disease_name} (Conf: {int(rd.confidence * 100)}%)",
                "timestamp": rd.created_at
            })
            
        # Add predictions
        recent_preds = predictions_query.order_by(models.Prediction.created_at.desc()).limit(3).all()
        for rp in recent_preds:
            desc = f"Calculated {rp.prediction_type} prediction"
            if rp.prediction_type == "yield":
                desc = f"Predicted yield for {rp.input_data.get('crop')} (Result: {rp.result_data.get('predicted_yield')} t/ha)"
            elif rp.prediction_type == "irrigation":
                desc = f"Irrigation forecast: {rp.result_data.get('water_needed')} L/m2 water recommended"
                
            recent_activities.append({
                "id": rp.id,
                "activity_type": rp.prediction_type,
                "description": desc,
                "timestamp": rp.created_at
            })
            
        # Sort recent activities by timestamp
        recent_activities = sorted(recent_activities, key=lambda x: x["timestamp"], reverse=True)[:5]
        
        # Fallback activity if empty
        if not recent_activities:
            recent_activities.append({
                "id": 1,
                "activity_type": "info",
                "description": "SmartFarm AI initialized. Dashboard is ready.",
                "timestamp": datetime.datetime.utcnow()
            })
            
        return {
            "kpis": kpis,
            "yield_trends": yield_trends,
            "disease_history": disease_history,
            "recent_activities": recent_activities
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error compiling dashboard details: {str(e)}"
        )
