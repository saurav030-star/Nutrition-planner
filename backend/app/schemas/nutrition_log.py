from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import date, datetime


class LoggedMealItem(BaseModel):
    meal_type: str
    name: str
    calories: float
    protein: float
    carbs: float
    fats: float
    completed: bool = True

class NutritionLogCreate(BaseModel):
    log_date: Optional[date] = None
    consumed_calories: float
    consumed_protein: float
    consumed_carbs: float
    consumed_fats: float
    items: List[LoggedMealItem] = []
    notes: Optional[str] = None

class NutritionLogResponse(BaseModel):
    id: int
    user_id: int
    log_date: date
    consumed_calories: float
    consumed_protein: float
    consumed_carbs: float
    consumed_fats: float
    target_calories: float
    target_protein: float
    target_carbs: float
    target_fats: float
    items: List[LoggedMealItem]
    notes: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

