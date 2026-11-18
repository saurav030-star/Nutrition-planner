from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, hash_password, create_access_token
from app.models.user import User
from app.models.profile import DietaryProfile
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.api.deps import get_current_user
from app.agents.profile_analyzer import calculate_bmr, ACTIVITY_MULTIPLIERS, GOAL_ADJUSTMENTS

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
        
    hashed = hash_password(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed,
        full_name=user_in.full_name or user_in.email.split("@")[0]
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Initialize default profile with calculated BMR & TDEE
    default_age = 25
    default_gender = "male"
    default_weight = 70.0
    default_height = 175.0
    default_activity = "moderately_active"
    default_goal = "weight_loss"
    
    bmr = calculate_bmr(default_weight, default_height, default_age, default_gender)
    tdee = round(bmr * ACTIVITY_MULTIPLIERS.get(default_activity, 1.55), 1)
    target_cal = round(tdee + GOAL_ADJUSTMENTS.get(default_goal, -500.0), 1)
    
    profile = DietaryProfile(
        user_id=user.id,
        age=default_age,
        gender=default_gender,
        weight=default_weight,
        height=default_height,
        activity_level=default_activity,
        health_goal=default_goal,
        diet_type="balanced",
        allergies="",
        bmr=bmr,
        tdee=tdee,
        target_calories=target_cal,
        target_protein_g=round(target_cal * 0.30 / 4.0, 1),
        target_carbs_g=round(target_cal * 0.40 / 4.0, 1),
        target_fats_g=round(target_cal * 0.30 / 9.0, 1)
    )
    db.add(profile)
    db.commit()
    
    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
