from fastapi import APIRouter, Depends, HTTPException, status, Response, Query, Header
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.models.profile import DietaryProfile
from app.models.meal_plan import MealPlan
from app.schemas.meal_plan import MealPlanGenerateRequest, MealPlanResponse
from app.api.deps import get_current_user
from app.agents.graph import run_nutrition_pipeline
from app.utils.pdf_export import generate_meal_plan_pdf


router = APIRouter(prefix="/meal-plans", tags=["Autonomous Meal Planning"])

def format_meal_plan_response(plan: MealPlan) -> dict:
    plan_dict = plan.get_plan()
    verification_dict = plan.get_verification()
    grocery_dict = plan.get_grocery()
    
    return {
        "id": plan.id,
        "user_id": plan.user_id,
        "title": plan.title,
        "duration_days": plan.duration_days,
        "target_calories": plan.target_calories,
        "target_protein": plan.target_protein,
        "target_carbs": plan.target_carbs,
        "target_fats": plan.target_fats,
        "days": plan_dict.get("days", []),
        "verification": verification_dict,
        "grocery_list": grocery_dict,
        "adherence_score": plan.adherence_score,
        "is_active": plan.is_active,
        "created_at": plan.created_at
    }

@router.post("/generate", response_model=MealPlanResponse)
def generate_plan(
    req: MealPlanGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(DietaryProfile).filter(DietaryProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dietary profile is required before generating a meal plan."
        )
        
    # Prepare initial state for LangGraph
    allergies_list = [a.strip() for a in profile.allergies.split(",") if a.strip()]
    if req.strict_allergies_override:
        allergies_list.extend(req.strict_allergies_override)
        
    initial_state = {
        "user_id": current_user.id,
        "age": profile.age,
        "gender": profile.gender,
        "weight": profile.weight,
        "height": profile.height,
        "activity_level": profile.activity_level,
        "health_goal": profile.health_goal,
        "diet_type": req.diet_type_override or profile.diet_type,
        "allergies": allergies_list,
        "duration_days": req.duration_days,
        "target_calories_override": req.target_calories_override
    }
    
    # Execute LangGraph Multi-Agent Pipeline
    agent_output = run_nutrition_pipeline(initial_state)
    
    # Requirement 5: If verification fails after 3 retries, return meaningful error instead of displaying an invalid plan
    if not agent_output.get("is_valid", True):
        remarks = agent_output.get("remarks", "Constraint verifier rejected the plan.")
        allergen_v = agent_output.get("allergen_violations", [])
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"LangGraph verification rejected plan after 3 retries: {remarks}"
        )
    
    # Deactivate previous active plans
    db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        MealPlan.is_active == True
    ).update({"is_active": False})
    
    # Store plan in PostgreSQL / SQLite
    verification_data = {
        "passed": agent_output.get("is_valid", True),
        "allergen_violations": agent_output.get("allergen_violations", []),
        "calorie_deviation_pct": agent_output.get("calorie_deviation_pct", 0.0),
        "confidence_score": agent_output.get("confidence_score", 100.0),
        "retry_count": agent_output.get("retry_count", 0),
        "violations": agent_output.get("violations", []),
        "remarks": agent_output.get("remarks", "Validated by LangGraph Constraint Verifier")
    }
    
    new_plan = MealPlan(
        user_id=current_user.id,
        title=f"{req.duration_days}-Day AI Optimized Meal Plan ({initial_state['diet_type'].capitalize()})",
        duration_days=req.duration_days,
        target_calories=agent_output.get("target_calories", 2000.0),
        target_protein=agent_output.get("target_protein_g", 150.0),
        target_carbs=agent_output.get("target_carbs_g", 200.0),
        target_fats=agent_output.get("target_fats_g", 65.0),
        plan_json=json.dumps({"days": agent_output.get("generated_days", [])}),
        verification_json=json.dumps(verification_data),
        grocery_json=json.dumps(agent_output.get("grocery_list", {})),
        adherence_score=agent_output.get("confidence_score", 100.0),
        is_active=True
    )
    
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    
    return format_meal_plan_response(new_plan)

@router.get("", response_model=List[MealPlanResponse])
def get_user_meal_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plans = db.query(MealPlan).filter(MealPlan.user_id == current_user.id).order_by(MealPlan.created_at.desc()).all()
    return [format_meal_plan_response(p) for p in plans]

@router.get("/active", response_model=MealPlanResponse)
def get_active_meal_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        MealPlan.is_active == True
    ).first()
    
    if not plan:
        # Fallback to the latest plan if none is explicitly marked active
        plan = db.query(MealPlan).filter(MealPlan.user_id == current_user.id).order_by(MealPlan.created_at.desc()).first()
        
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active meal plan found. Generate a plan first."
        )
        
    return format_meal_plan_response(plan)

@router.get("/{plan_id}", response_model=MealPlanResponse)
def get_meal_plan_by_id(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(MealPlan).filter(MealPlan.id == plan_id, MealPlan.user_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal plan not found")
    return format_meal_plan_response(plan)

@router.get("/{plan_id}/pdf")
def export_meal_plan_pdf(
    plan_id: int,
    token: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user_id = None
    # 1. Try Bearer token in header
    if authorization and authorization.startswith("Bearer "):
        jwt_token = authorization.split(" ")[1]
        payload = decode_access_token(jwt_token)
        if payload and payload.get("sub"):
            try:
                user_id = int(payload["sub"])
            except ValueError:
                pass
                
    # 2. Try token in query param
    if not user_id and token:
        payload = decode_access_token(token)
        if payload and payload.get("sub"):
            try:
                user_id = int(payload["sub"])
            except ValueError:
                pass

    # 3. Fetch plan
    plan = None
    if user_id:
        plan = db.query(MealPlan).filter(MealPlan.id == plan_id, MealPlan.user_id == user_id).first()
    if not plan:
        plan = db.query(MealPlan).filter(MealPlan.id == plan_id).first()
        
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal plan not found")
        
    user = plan.user
    user_name = (user.full_name or user.email) if user else "Nutrition Pro"
    
    # Retrieve user dietary profile for complete medical/biometric report
    profile = db.query(DietaryProfile).filter(DietaryProfile.user_id == plan.user_id).first()
    profile_dict = {
        "age": profile.age if profile else 25,
        "gender": profile.gender if profile else "Male",
        "weight": profile.weight if profile else 70,
        "height": profile.height if profile else 175,
        "activity_level": profile.activity_level if profile else "moderately_active",
        "health_goal": profile.health_goal if profile else "weight_loss",
        "diet_type": profile.diet_type if profile else "vegetarian",
        "bmr": profile.bmr if profile else None,
        "tdee": profile.tdee if profile else None
    }
    
    plan_data = plan.get_plan()
    verification_data = plan.get_verification()
    grocery_data = plan.get_grocery()
    
    pdf_bytes = generate_meal_plan_pdf(
        user_name=user_name,
        plan_title=plan.title,
        target_calories=plan.target_calories,
        target_protein=plan.target_protein,
        target_carbs=plan.target_carbs,
        target_fats=plan.target_fats,
        days=plan_data.get("days", []),
        grocery_list=grocery_data,
        verification=verification_data,
        profile_data=profile_dict
    )
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=Nutrition_Plan_{plan_id}.pdf"
        }
    )


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meal_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(MealPlan).filter(MealPlan.id == plan_id, MealPlan.user_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal plan not found")
    db.delete(plan)
    db.commit()
    return None
