"""
Macro Optimizer Agent
Calculates macronutrient distribution based on target calories, weight, and fitness protocol.
Follows evidence-based sports nutrition:
- Protein: 4 kcal/g
- Carbohydrates: 4 kcal/g
- Fats: 9 kcal/g

Supports all 5 clinical dietary frameworks:
- Vegetarian (Lacto-Vegetarian)
- 100% Plant-Based Vegan
- Balanced Whole Foods
- High-Protein Hypertrophy
- Low-Carb / Ketogenic
"""

from typing import Dict, Any
from app.agents.state import AgentState

# Macro split presets by dietary framework and goal (Protein %, Carbs %, Fats %)
MACRO_PRESETS = {
    "balanced": {"protein": 0.30, "carbs": 0.40, "fats": 0.30},
    "high_protein": {"protein": 0.35, "carbs": 0.35, "fats": 0.30},
    "low_carb": {"protein": 0.35, "carbs": 0.20, "fats": 0.45},
    "vegetarian": {"protein": 0.28, "carbs": 0.45, "fats": 0.27},
    "vegan": {"protein": 0.25, "carbs": 0.50, "fats": 0.25},
    "keto": {"protein": 0.25, "carbs": 0.05, "fats": 0.70},
    "mediterranean": {"protein": 0.25, "carbs": 0.45, "fats": 0.30},
    "weight_loss": {"protein": 0.35, "carbs": 0.35, "fats": 0.30},
    "muscle_gain": {"protein": 0.30, "carbs": 0.45, "fats": 0.25},
    "athletic_performance": {"protein": 0.25, "carbs": 0.55, "fats": 0.20}
}

def macro_optimizer_node(state: AgentState) -> Dict[str, Any]:
    """
    Macro Optimizer Agent Node for LangGraph.
    Calculates exact gram targets for protein, carbohydrates, and fats based on calories and framework.
    """
    logs = list(state.get("agent_logs", []))
    
    target_calories = state.get("target_calories", 2000.0)
    diet_type = state.get("diet_type", "balanced").lower()
    health_goal = state.get("health_goal", "weight_loss").lower()
    weight_kg = state.get("weight", 70.0)
    
    # Priority: explicit diet_type presets, then health_goal, fallback to balanced
    if diet_type in MACRO_PRESETS:
        split = MACRO_PRESETS[diet_type]
    elif health_goal in MACRO_PRESETS:
        split = MACRO_PRESETS[health_goal]
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
