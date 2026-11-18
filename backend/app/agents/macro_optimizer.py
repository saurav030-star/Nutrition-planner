"""
Macro Optimizer Agent
Calculates macronutrient distribution based on target calories, weight, and fitness protocol.
Follows evidence-based sports nutrition:
- Protein: 4 kcal/g
- Carbohydrates: 4 kcal/g
- Fats: 9 kcal/g
"""

from typing import Dict, Any
from app.agents.state import AgentState

# Macro split presets by diet type and goal (Protein %, Carbs %, Fats %)
MACRO_PRESETS = {
    "keto": {"protein": 0.25, "carbs": 0.05, "fats": 0.70},
    "low_carb": {"protein": 0.35, "carbs": 0.25, "fats": 0.40},
    "muscle_gain": {"protein": 0.30, "carbs": 0.45, "fats": 0.25},
    "weight_loss": {"protein": 0.35, "carbs": 0.35, "fats": 0.30},
    "athletic_performance": {"protein": 0.25, "carbs": 0.55, "fats": 0.20},
    "mediterranean": {"protein": 0.25, "carbs": 0.45, "fats": 0.30},
    "balanced": {"protein": 0.30, "carbs": 0.40, "fats": 0.30}
}

def macro_optimizer_node(state: AgentState) -> Dict[str, Any]:
    """
    Macro Optimizer Agent Node for LangGraph.
    Calculates exact gram targets for protein, carbohydrates, and fats.
    """
    logs = list(state.get("agent_logs", []))
    
    target_calories = state.get("target_calories", 2000.0)
    diet_type = state.get("diet_type", "balanced").lower()
    health_goal = state.get("health_goal", "weight_loss").lower()
    weight_kg = state.get("weight", 70.0)
    
    # Select macro split preset
    if diet_type == "keto":
        split = MACRO_PRESETS["keto"]
    elif diet_type == "low_carb":
        split = MACRO_PRESETS["low_carb"]
    elif health_goal in MACRO_PRESETS:
        split = MACRO_PRESETS[health_goal]
    elif diet_type in MACRO_PRESETS:
        split = MACRO_PRESETS[diet_type]
    else:
        split = MACRO_PRESETS["balanced"]
        
    # Calculate grams
    # Protein: 4 kcal/g (also ensure minimum 1.6g/kg bodyweight for health retention)
    protein_cal = target_calories * split["protein"]
    protein_g = round(max(protein_cal / 4.0, weight_kg * 1.6), 1)
    
    # Recalculate remaining calories after protein allocation
    remaining_cal = max(0.0, target_calories - (protein_g * 4.0))
    carb_ratio = split["carbs"] / (split["carbs"] + split["fats"])
    fat_ratio = split["fats"] / (split["carbs"] + split["fats"])
    
    carbs_cal = remaining_cal * carb_ratio
    fats_cal = remaining_cal * fat_ratio
    
    carbs_g = round(carbs_cal / 4.0, 1)
    fats_g = round(fats_cal / 9.0, 1)
    
    log_entry = {
        "agent": "MacroOptimizer",
        "action": "OPTIMIZED_MACRONUTRIENTS",
        "details": f"Protein: {protein_g}g ({round(protein_g*4/target_calories*100, 1)}%) | Carbs: {carbs_g}g ({round(carbs_g*4/target_calories*100, 1)}%) | Fats: {fats_g}g ({round(fats_g*9/target_calories*100, 1)}%)"
    }
    logs.append(log_entry)
    
    return {
        "target_protein_g": protein_g,
        "target_carbs_g": carbs_g,
        "target_fats_g": fats_g,
        "macro_split": split,
        "agent_logs": logs
    }
