from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import json
from app.core.database import Base

class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String, nullable=False, default="AI Personalized Nutrition Plan")
    duration_days = Column(Integer, nullable=False, default=7)
    target_calories = Column(Float, nullable=False)
    target_protein = Column(Float, nullable=False)
    target_carbs = Column(Float, nullable=False)
    target_fats = Column(Float, nullable=False)
    
    # Serialized JSON structures
    plan_json = Column(Text, nullable=False)  # Full multi-day meals structure
    verification_json = Column(Text, nullable=True)  # Verifier report & metrics
    grocery_json = Column(Text, nullable=True)  # Aisle-by-aisle categorized groceries
    
    adherence_score = Column(Float, default=100.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="meal_plans")

    def get_plan(self):
        return json.loads(self.plan_json) if self.plan_json else {}

    def get_verification(self):
        return json.loads(self.verification_json) if self.verification_json else {}

    def get_grocery(self):
        return json.loads(self.grocery_json) if self.grocery_json else {}
