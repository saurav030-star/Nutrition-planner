from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.profile import DietaryProfile
from app.schemas.profile import DietaryProfileUpdate, DietaryProfileResponse
from app.api.deps import get_current_user
from app.agents.profile_analyzer import calculate_bmr, ACTIVITY_MULTIPLIERS, GOAL_ADJUSTMENTS

router = APIRouter(prefix="/profile", tags=["Dietary Profile"])

@router.get("", response_model=DietaryProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(DietaryProfile).filter(DietaryProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dietary profile not found")
    return profile

@router.put("", response_model=DietaryProfileResponse)
def update_profile(
    profile_in: DietaryProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(DietaryProfile).filter(DietaryProfile.user_id == current_user.id).first()
    if not profile:
        profile = DietaryProfile(
            user_id=current_user.id,
            age=profile_in.age or 25,
            gender=profile_in.gender or "male",
            weight=profile_in.weight or 70.0,
            height=profile_in.height or 175.0,
            activity_level=profile_in.activity_level or "moderately_active",
            health_goal=profile_in.health_goal or "weight_loss",
            diet_type=profile_in.diet_type or "balanced",
            allergies=profile_in.allergies or "",
            disliked_ingredients=profile_in.disliked_ingredients or "",
            medical_conditions=profile_in.medical_conditions or "",
        )
        db.add(profile)
        db.flush()
        
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
        
    # Recalculate BMR, TDEE and targets
    bmr = calculate_bmr(profile.weight, profile.height, profile.age, profile.gender)
    multiplier = ACTIVITY_MULTIPLIERS.get(profile.activity_level.lower(), 1.55)
    tdee = round(bmr * multiplier, 1)
    target_cal = round(max(1200.0, tdee + GOAL_ADJUSTMENTS.get(profile.health_goal.lower(), 0.0)), 1)
    
    profile.bmr = bmr
    profile.tdee = tdee
    profile.target_calories = target_cal
    profile.target_protein_g = round(target_cal * 0.30 / 4.0, 1)
    profile.target_carbs_g = round(target_cal * 0.40 / 4.0, 1)
    profile.target_fats_g = round(target_cal * 0.30 / 9.0, 1)
    
    db.commit()
    db.refresh(profile)
    return profile
