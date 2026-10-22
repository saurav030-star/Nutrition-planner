"""
Profile Analyzer / Requirement Parser Agent
Implements clinical Mifflin-St Jeor equation for Basal Metabolic Rate (BMR)
and computes Total Daily Energy Expenditure (TDEE) based on activity multipliers.
Extracts and sanitizes allergen boundaries.
"""

from typing import Dict, Any, List
from app.agents.state import AgentState

ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.2,
    "lightly_active": 1.375,
    "moderately_active": 1.55,
    "very_active": 1.725,
    "extra_active": 1.9
}

GOAL_ADJUSTMENTS = {
    "weight_loss": -500.0,            # ~0.5kg/week healthy fat loss
    "muscle_gain": 350.0,             # clean lean bulking surplus
    "maintenance": 0.0,               # energy equilibrium
    "athletic_performance": 250.0,    # endurance & glycogen replenishment
    "rapid_fat_loss": -750.0
}

def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    """Mifflin-St Jeor Equation"""
    base = (10.0 * weight_kg) + (6.25 * height_cm) - (5.0 * age)
    if gender.lower() == "female":
        return round(base - 161.0, 1)
    else:  # male or default
        return round(base + 5.0, 1)

def profile_analyzer_node(state: AgentState) -> Dict[str, Any]:
    """
    Profile Analyzer Agent Node for LangGraph.
    Parses biometrics, computes BMR, TDEE, target calories, and sanitizes allergens.
    """
    logs = list(state.get("agent_logs", []))
    
    age = state.get("age", 25)
    gender = state.get("gender", "male")
    weight = state.get("weight", 70.0)
    height = state.get("height", 175.0)
    activity = state.get("activity_level", "moderately_active")
    goal = state.get("health_goal", "weight_loss")
    
    # 1. Calculate BMR
    bmr = calculate_bmr(weight, height, age, gender)
    
    # 2. Calculate TDEE
    multiplier = ACTIVITY_MULTIPLIERS.get(activity.lower(), 1.55)
    tdee = round(bmr * multiplier, 1)
    
    # 3. Target Calories with Goal Adjustment
    if state.get("target_calories_override"):
        target_calories = float(state["target_calories_override"])
    else:
        goal_delta = GOAL_ADJUSTMENTS.get(goal.lower(), 0.0)
        target_calories = round(max(1200.0, tdee + goal_delta), 1)  # safe metabolic floor
        
    # 4. Parse Allergens
    raw_allergies = state.get("allergies", [])
    if isinstance(raw_allergies, str):
        parsed_allergens = [a.strip().lower() for a in raw_allergies.split(",") if a.strip()]
    elif isinstance(raw_allergies, list):
        parsed_allergens = [str(a).strip().lower() for a in raw_allergies if str(a).strip()]
    else:
        parsed_allergens = []
        
    log_entry = {
        "agent": "ProfileAnalyzer",
        "action": "PARSED_BIOMETRICS",
        "details": f"BMR: {bmr} kcal | TDEE: {tdee} kcal | Target: {target_calories} kcal | Goal: {goal} | Allergens: {parsed_allergens}"
    }
    logs.append(log_entry)
    
    return {
        "bmr": bmr,
        "tdee": tdee,
        "target_calories": target_calories,
        "parsed_allergens": parsed_allergens,
        "agent_logs": logs
    }
