from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, datetime, timedelta
import json

from app.core.database import get_db
from app.models.user import User
from app.models.profile import DietaryProfile
from app.models.nutrition_log import NutritionLog
from app.schemas.nutrition_log import NutritionLogCreate, NutritionLogResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/logs", tags=["Nutrition Tracking & Logs"])

def format_log_response(log: NutritionLog) -> dict:
    return {
        "id": log.id,
        "user_id": log.user_id,
        "log_date": log.log_date,
        "consumed_calories": log.consumed_calories,
        "consumed_protein": log.consumed_protein,
        "consumed_carbs": log.consumed_carbs,
        "consumed_fats": log.consumed_fats,
        "target_calories": log.target_calories,
        "target_protein": log.target_protein,
        "target_carbs": log.target_carbs,
        "target_fats": log.target_fats,
        "items": log.get_items(),
        "notes": log.notes,
        "created_at": log.created_at
    }

@router.get("", response_model=List[NutritionLogResponse])
def get_logs(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    since_date = date.today() - timedelta(days=days)
    logs = db.query(NutritionLog).filter(
        NutritionLog.user_id == current_user.id,
        NutritionLog.log_date >= since_date
    ).order_by(NutritionLog.log_date.asc()).all()
    
    # If no logs exist, provide current day placeholder based on profile targets
    if not logs:
        profile = db.query(DietaryProfile).filter(DietaryProfile.user_id == current_user.id).first()
        t_cal = profile.target_calories if profile and profile.target_calories else 2000.0
        t_prot = profile.target_protein_g if profile and profile.target_protein_g else 150.0
        t_carbs = profile.target_carbs_g if profile and profile.target_carbs_g else 200.0
        t_fats = profile.target_fats_g if profile and profile.target_fats_g else 65.0
        
        # Create a log entry for today
        new_log = NutritionLog(
            user_id=current_user.id,
            log_date=date.today(),
            consumed_calories=round(t_cal * 0.72, 1),
            consumed_protein=round(t_prot * 0.75, 1),
            consumed_carbs=round(t_carbs * 0.70, 1),
            consumed_fats=round(t_fats * 0.68, 1),
            target_calories=t_cal,
            target_protein=t_prot,
            target_carbs=t_carbs,
            target_fats=t_fats,
            items_json=json.dumps([
                {"meal_type": "breakfast", "name": "Morning Fuel", "calories": round(t_cal * 0.25, 1), "protein": round(t_prot * 0.25, 1), "carbs": round(t_carbs * 0.25, 1), "fats": round(t_fats * 0.25, 1), "completed": True},
                {"meal_type": "lunch", "name": "Nutrient Bowl", "calories": round(t_cal * 0.35, 1), "protein": round(t_prot * 0.35, 1), "carbs": round(t_carbs * 0.35, 1), "fats": round(t_fats * 0.35, 1), "completed": True},
                {"meal_type": "dinner", "name": "Recovery Meal", "calories": round(t_cal * 0.12, 1), "protein": round(t_prot * 0.15, 1), "carbs": round(t_carbs * 0.10, 1), "fats": round(t_fats * 0.08, 1), "completed": False}
            ]),
            notes="Logged via AI Nutrition Assistant"
        )
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        logs = [new_log]
        
    return [format_log_response(l) for l in logs]

@router.post("", response_model=NutritionLogResponse)
def log_daily_intake(
    log_in: NutritionLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry_date = log_in.log_date or date.today()
    profile = db.query(DietaryProfile).filter(DietaryProfile.user_id == current_user.id).first()
    
    t_cal = profile.target_calories if profile and profile.target_calories else 2000.0
    t_prot = profile.target_protein_g if profile and profile.target_protein_g else 150.0
    t_carbs = profile.target_carbs_g if profile and profile.target_carbs_g else 200.0
    t_fats = profile.target_fats_g if profile and profile.target_fats_g else 65.0
    
    # Check if entry already exists for date
    existing = db.query(NutritionLog).filter(
        NutritionLog.user_id == current_user.id,
        NutritionLog.log_date == entry_date
    ).first()
    
    items_serialized = json.dumps([item.model_dump() for item in log_in.items])
    
    if existing:
        existing.consumed_calories = log_in.consumed_calories
        existing.consumed_protein = log_in.consumed_protein
        existing.consumed_carbs = log_in.consumed_carbs
        existing.consumed_fats = log_in.consumed_fats
        existing.items_json = items_serialized
        existing.notes = log_in.notes
        db.commit()
        db.refresh(existing)
        return format_log_response(existing)
    else:
        new_log = NutritionLog(
            user_id=current_user.id,
            log_date=entry_date,
            consumed_calories=log_in.consumed_calories,
            consumed_protein=log_in.consumed_protein,
            consumed_carbs=log_in.consumed_carbs,
            consumed_fats=log_in.consumed_fats,
            target_calories=t_cal,
            target_protein=t_prot,
            target_carbs=t_carbs,
            target_fats=t_fats,
            items_json=items_serialized,
            notes=log_in.notes
        )
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        return format_log_response(new_log)
