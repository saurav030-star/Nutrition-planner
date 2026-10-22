from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class DietaryProfile(Base):
    __tablename__ = "dietary_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Biometrics
    age = Column(Integer, nullable=False, default=25)
    gender = Column(String, nullable=False, default="male")  # male, female, other
    weight = Column(Float, nullable=False, default=70.0)      # kg
    height = Column(Float, nullable=False, default=175.0)     # cm
    activity_level = Column(String, nullable=False, default="moderately_active")
    
    # Preferences & Restrictions
    health_goal = Column(String, nullable=False, default="weight_loss")
    diet_type = Column(String, nullable=False, default="balanced")
    allergies = Column(Text, nullable=True, default="")  # comma-separated string
    disliked_ingredients = Column(Text, nullable=True, default="")
    medical_conditions = Column(Text, nullable=True, default="")
    
    # Computed Nutritional Targets
    bmr = Column(Float, nullable=True)
    tdee = Column(Float, nullable=True)
    target_calories = Column(Float, nullable=True)
    target_protein_g = Column(Float, nullable=True)
    target_carbs_g = Column(Float, nullable=True)
    target_fats_g = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="profile")
