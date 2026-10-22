from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from datetime import datetime, date, timezone
import json
from app.core.database import Base

class NutritionLog(Base):
    __tablename__ = "nutrition_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    log_date = Column(Date, nullable=False, default=date.today, index=True)
    
    # Consumed values
    consumed_calories = Column(Float, default=0.0)
    consumed_protein = Column(Float, default=0.0)
    consumed_carbs = Column(Float, default=0.0)
    consumed_fats = Column(Float, default=0.0)
    
    # Target values for comparison
    target_calories = Column(Float, default=2000.0)
    target_protein = Column(Float, default=150.0)
    target_carbs = Column(Float, default=200.0)
    target_fats = Column(Float, default=65.0)
    
    # Logged meals list: e.g. [{"meal_type": "breakfast", "meal_name": "Oatmeal", "calories": 420, "completed": True}]
    items_json = Column(Text, default="[]")
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="logs")

    def get_items(self):
        return json.loads(self.items_json) if self.items_json else []
