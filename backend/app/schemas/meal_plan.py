from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime


class IngredientItem(BaseModel):
    name: str
    quantity: float
    unit: str
    aisle: str = "Pantry & Staples"

class MealItem(BaseModel):
    id: str
    meal_type: str  # breakfast, lunch, dinner, snack
    name: str
    description: str
    prep_time_minutes: int = 15
    cook_time_minutes: int = 20
    calories: float
    protein: float
    carbs: float
    fats: float
    ingredients: List[IngredientItem]
    instructions: List[str]
    allergens: List[str] = []

class DayMealPlan(BaseModel):
    day_number: int
    day_name: str
    meals: List[MealItem]
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fats: float

class VerificationViolation(BaseModel):
    rule: str
    description: str
    severity: str = "HIGH"

class VerificationResult(BaseModel):
    passed: bool
    allergen_violations: List[str] = []
    calorie_deviation_pct: float = 0.0
    confidence_score: float = 100.0
    retry_count: int = 0
    violations: List[VerificationViolation] = []
    remarks: str = "All nutritional constraints and allergen boundaries validated successfully."

class GroceryCategory(BaseModel):
    category: str
    items: List[str]

class MealPlanGenerateRequest(BaseModel):
    duration_days: int = Field(default=7, ge=1, le=90)
    target_calories_override: Optional[float] = None
    strict_allergies_override: Optional[List[str]] = None
    diet_type_override: Optional[str] = None

class MealPlanResponse(BaseModel):
    id: int
    user_id: int
    title: str
    duration_days: int
    target_calories: float
    target_protein: float
    target_carbs: float
    target_fats: float
    days: List[DayMealPlan]
    verification: VerificationResult
    grocery_list: Dict[str, List[str]]
    adherence_score: float
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

