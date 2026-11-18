from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class DietaryProfileBase(BaseModel):
    age: int = Field(default=25, ge=12, le=120)
    gender: str = Field(default="male", description="male, female, other")
    weight: float = Field(default=70.0, ge=30.0, le=300.0, description="Weight in kg")
    height: float = Field(default=175.0, ge=100.0, le=250.0, description="Height in cm")
    activity_level: str = Field(default="moderately_active", description="sedentary, lightly_active, moderately_active, very_active, extra_active")
    health_goal: str = Field(default="weight_loss", description="weight_loss, muscle_gain, maintenance, athletic_performance")
    diet_type: str = Field(default="balanced", description="balanced, vegetarian, vegan, keto, paleo, mediterranean, low_carb")
    allergies: Optional[str] = Field(default="", description="Comma-separated list of allergens (e.g. peanuts, shellfish, dairy)")
    disliked_ingredients: Optional[str] = Field(default="", description="Comma-separated list of ingredients to avoid")
    medical_conditions: Optional[str] = Field(default="", description="Medical or lifestyle constraints (e.g. diabetic_friendly, low_sodium)")

class DietaryProfileCreate(DietaryProfileBase):
    pass

class DietaryProfileUpdate(BaseModel):
    age: Optional[int] = Field(default=None, ge=14, le=100)
    gender: Optional[str] = None
    weight: Optional[float] = Field(default=None, ge=30.0, le=250.0)
    height: Optional[float] = Field(default=None, ge=100.0, le=250.0)
    activity_level: Optional[str] = None
    health_goal: Optional[str] = None
    diet_type: Optional[str] = None
    allergies: Optional[str] = None
    disliked_ingredients: Optional[str] = None
    medical_conditions: Optional[str] = None

class DietaryProfileResponse(DietaryProfileBase):
    id: int
    user_id: int
    bmr: Optional[float] = None
    tdee: Optional[float] = None
    target_calories: Optional[float] = None
    target_protein_g: Optional[float] = None
    target_carbs_g: Optional[float] = None
    target_fats_g: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

