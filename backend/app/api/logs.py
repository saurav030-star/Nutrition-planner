from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, datetime, timedelta
import json

from app.core.database import get_db
from app.models.user import User
from app.models.profile import DietaryProfile
from app.models.meal_plan import MealPlan
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
    
    # Check if a log for today exists; if not, initialize one with 0 consumed calories
    today_log = next((l for l in logs if l.log_date == date.today()), None)
    if not today_log:
        active_plan = db.query(MealPlan).filter(
            MealPlan.user_id == current_user.id,
            MealPlan.is_active == True
        ).first()
        
        if active_plan:
            t_cal = round(active_plan.target_calories, 1)
            t_prot = round(active_plan.target_protein, 1)
            t_carbs = round(active_plan.target_carbs, 1)
            t_fats = round(active_plan.target_fats, 1)
            plan_dict = active_plan.get_plan()
            day1_meals = []
            if plan_dict and "days" in plan_dict and len(plan_dict["days"]) > 0:
                day1_meals = plan_dict["days"][0].get("meals", [])
            
            def meal_order_key(m):
                mt = str(m.get("meal_type", "")).lower()
                order = {"breakfast": 0, "lunch": 1, "snack": 2, "snacks": 2, "dinner": 3}
                return order.get(mt, 4)

            items = []
            for m in sorted(day1_meals, key=meal_order_key):
                m_type = m.get("meal_type", "meal").lower()
                items.append({
                    "meal_type": m_type,
                    "name": m_type.capitalize() if m_type in ["breakfast", "lunch", "dinner", "snack", "snacks"] else "Meal",
                    "summary": m.get("title") or m.get("name") or "Healthy Meal",
                    "calories": round(float(m.get("calories", 0)), 1),
                    "protein": round(float(m.get("protein", 0)), 1),
                    "carbs": round(float(m.get("carbs", 0)), 1),
                    "fats": round(float(m.get("fats", 0)), 1),
                    "completed": False
                })
        else:
            profile = db.query(DietaryProfile).filter(DietaryProfile.user_id == current_user.id).first()
            t_cal = round(profile.target_calories, 1) if profile and profile.target_calories else 2451.0
            t_prot = round(profile.target_protein_g, 1) if profile and profile.target_protein_g else 184.0
            t_carbs = round(profile.target_carbs_g, 1) if profile and profile.target_carbs_g else 245.0
            t_fats = round(profile.target_fats_g, 1) if profile and profile.target_fats_g else 82.0
            items = [
                {"meal_type": "breakfast", "name": "Breakfast", "summary": "Oats with milk & fruits", "calories": round(t_cal * 0.25, 1), "protein": round(t_prot * 0.25, 1), "carbs": round(t_carbs * 0.25, 1), "fats": round(t_fats * 0.25, 1), "completed": False},
                {"meal_type": "lunch", "name": "Lunch", "summary": "Rice, dal & vegetables", "calories": round(t_cal * 0.35, 1), "protein": round(t_prot * 0.35, 1), "carbs": round(t_carbs * 0.35, 1), "fats": round(t_fats * 0.35, 1), "completed": False},
                {"meal_type": "snack", "name": "Snacks", "summary": "Nuts & fresh fruit", "calories": round(t_cal * 0.10, 1), "protein": round(t_prot * 0.10, 1), "carbs": round(t_carbs * 0.10, 1), "fats": round(t_fats * 0.10, 1), "completed": False},
                {"meal_type": "dinner", "name": "Dinner", "summary": "Chapati, paneer sabzi", "calories": round(t_cal * 0.30, 1), "protein": round(t_prot * 0.30, 1), "carbs": round(t_carbs * 0.30, 1), "fats": round(t_fats * 0.30, 1), "completed": False}
            ]
        
        # Fresh log for today initialized with 0 completed calories
        today_log = NutritionLog(
            user_id=current_user.id,
            log_date=date.today(),
            consumed_calories=0.0,
            consumed_protein=0.0,
            consumed_carbs=0.0,
            consumed_fats=0.0,
            target_calories=t_cal,
            target_protein=t_prot,
            target_carbs=t_carbs,
            target_fats=t_fats,
            items_json=json.dumps(items),
            notes="Daily log initialized"
        )
        db.add(today_log)
        db.commit()
        db.refresh(today_log)
        logs.append(today_log)
        logs.sort(key=lambda x: x.log_date)
        
    return [format_log_response(l) for l in logs]

@router.post("", response_model=NutritionLogResponse)
def log_daily_intake(
    log_in: NutritionLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry_date = log_in.log_date or date.today()
    
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
        if log_in.notes:
            existing.notes = log_in.notes
        db.commit()
        db.refresh(existing)
        return format_log_response(existing)
    else:
        active_plan = db.query(MealPlan).filter(
            MealPlan.user_id == current_user.id,
            MealPlan.is_active == True
        ).first()
        if active_plan:
            t_cal = round(active_plan.target_calories, 1)
            t_prot = round(active_plan.target_protein, 1)
            t_carbs = round(active_plan.target_carbs, 1)
            t_fats = round(active_plan.target_fats, 1)
        else:
            profile = db.query(DietaryProfile).filter(DietaryProfile.user_id == current_user.id).first()
            t_cal = round(profile.target_calories, 1) if profile and profile.target_calories else 2451.0
            t_prot = round(profile.target_protein_g, 1) if profile and profile.target_protein_g else 184.0
            t_carbs = round(profile.target_carbs_g, 1) if profile and profile.target_carbs_g else 245.0
            t_fats = round(profile.target_fats_g, 1) if profile and profile.target_fats_g else 82.0
            
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
            notes=log_in.notes or "Logged via AI Nutrition Assistant"
        )
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        return format_log_response(new_log)
