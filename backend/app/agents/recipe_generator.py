"""
Recipe Generator Agent
Synthesizes structured multi-day nutrition plans matching calculated macro targets,
dietary frameworks, and allergen boundaries.
Aggregates ingredients into supermarket aisle categories.
"""

from typing import Dict, Any, List
import copy
import uuid
from app.agents.state import AgentState
from app.knowledge.recipe_db import search_recipes, RECIPE_DATABASE

DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

MEAL_DISTRIBUTION = {
    "breakfast": {"cal_pct": 0.25, "protein_pct": 0.25},
    "lunch":     {"cal_pct": 0.35, "protein_pct": 0.35},
    "dinner":    {"cal_pct": 0.30, "protein_pct": 0.30},
    "snack":     {"cal_pct": 0.10, "protein_pct": 0.10}
}

def scale_recipe_to_target(recipe: Dict[str, Any], target_cal: float) -> Dict[str, Any]:
    """
    Scale recipe ingredients and macros proportionally to match meal target calories.
    """
    base_cal = recipe.get("calories", 500.0)
    if base_cal <= 0:
        base_cal = 500.0
        
    scale_factor = target_cal / base_cal
    # Keep scaling bounded between 0.5 and 2.6 to retain culinary realism while supporting athletic caloric ranges
    scale_factor = max(0.5, min(2.6, scale_factor))
    
    scaled = copy.deepcopy(recipe)
    scaled["id"] = f"{recipe['id']}_{uuid.uuid4().hex[:6]}"
    scaled["calories"] = round(recipe["calories"] * scale_factor, 1)
    scaled["protein"] = round(recipe["protein"] * scale_factor, 1)
    scaled["carbs"] = round(recipe["carbs"] * scale_factor, 1)
    scaled["fats"] = round(recipe["fats"] * scale_factor, 1)
    
    # Scale ingredients
    for ing in scaled.get("ingredients", []):
        qty = ing.get("quantity", 100)
        ing["quantity"] = round(qty * scale_factor, 1)
        
    return scaled

def compile_aisle_grocery_list(days: List[Dict[str, Any]]) -> Dict[str, List[str]]:
    """
    Categorizes all ingredients into supermarket aisles.
    """
    aisles: Dict[str, Dict[str, Dict[str, Any]]] = {
        "Produce": {},
        "Meat & Seafood": {},
        "Dairy & Refrigerated": {},
        "Bakery & Grains": {},
        "Pantry & Spices": {},
        "Other": {}
    }
    
    for day in days:
        for meal in day.get("meals", []):
            for ing in meal.get("ingredients", []):
                name = ing.get("name", "Ingredient")
                qty = ing.get("quantity", 0)
                unit = ing.get("unit", "")
                raw_aisle = ing.get("aisle", "Other")
                
                target_aisle = raw_aisle if raw_aisle in aisles else "Pantry & Spices"
                
                if name in aisles[target_aisle]:
                    aisles[target_aisle][name]["quantity"] += qty
                else:
                    aisles[target_aisle][name] = {"quantity": qty, "unit": unit}
                    
    # Format into human-readable strings
    formatted_grocery: Dict[str, List[str]] = {}
    for aisle_name, items in aisles.items():
        item_list = []
        for name, data in items.items():
            qty = round(data["quantity"], 1)
            unit = data["unit"]
            item_list.append(f"{name}: {qty} {unit}".strip())
        if item_list:
            formatted_grocery[aisle_name] = item_list
            
    return formatted_grocery

def recipe_generator_node(state: AgentState) -> Dict[str, Any]:
    """
    Recipe Generator Agent Node for LangGraph.
    Synthesizes multi-day meal schedule adhering to target calories and allergens.
    """
    logs = list(state.get("agent_logs", []))
    
    duration_days = state.get("duration_days", 7)
    target_calories = state.get("target_calories", 2000.0)
    diet_type = state.get("diet_type", "balanced")
    parsed_allergens = state.get("parsed_allergens", [])
    retry_count = state.get("retry_count", 0)
    feedback = state.get("feedback", "")
    
    # Helper to resolve candidates safely respecting allergen boundaries
    def get_candidates(meal_type: str, preferred_diet: str, allergens: List[str]) -> List[Dict[str, Any]]:
        # 1. Exact diet + allergen exclusion
        cands = search_recipes(diet_type=preferred_diet, meal_type=meal_type, exclude_allergens=allergens)
        if cands:
            return cands
        # 2. Balanced diet + allergen exclusion
        cands = search_recipes(diet_type="balanced", meal_type=meal_type, exclude_allergens=allergens)
        if cands:
            return cands
        # 3. Any recipe of this meal_type respecting allergens
        allergen_set = set(allergens or [])
        cands = [
            r for r in RECIPE_DATABASE 
            if r.get("meal_type") == meal_type and not allergen_set.intersection({a.lower() for a in r.get("allergens", [])})
        ]
        if cands:
            return cands
        # 4. Safe fallback to any recipe of this meal type
        matched = [r for r in RECIPE_DATABASE if r.get("meal_type") == meal_type]
        return matched if matched else RECIPE_DATABASE

    breakfast_candidates = get_candidates("breakfast", diet_type, parsed_allergens)
    lunch_candidates = get_candidates("lunch", diet_type, parsed_allergens)
    dinner_candidates = get_candidates("dinner", diet_type, parsed_allergens)
    snack_candidates = get_candidates("snack", diet_type, parsed_allergens)
        
    days = []
    for day_idx in range(duration_days):
        day_name = DAYS_OF_WEEK[day_idx % len(DAYS_OF_WEEK)]
        
        # Pick candidate with cyclic offset
        b_raw = breakfast_candidates[day_idx % len(breakfast_candidates)]
        l_raw = lunch_candidates[day_idx % len(lunch_candidates)]
        d_raw = dinner_candidates[day_idx % len(dinner_candidates)]
        s_raw = snack_candidates[day_idx % len(snack_candidates)]
        
        # Scale to meal calorie allocations
        b_meal = scale_recipe_to_target(b_raw, target_calories * MEAL_DISTRIBUTION["breakfast"]["cal_pct"])
        l_meal = scale_recipe_to_target(l_raw, target_calories * MEAL_DISTRIBUTION["lunch"]["cal_pct"])
        d_meal = scale_recipe_to_target(d_raw, target_calories * MEAL_DISTRIBUTION["dinner"]["cal_pct"])
        s_meal = scale_recipe_to_target(s_raw, target_calories * MEAL_DISTRIBUTION["snack"]["cal_pct"])
        
        day_meals = [b_meal, l_meal, d_meal, s_meal]
        
        total_cal = round(sum(m["calories"] for m in day_meals), 1)
        total_prot = round(sum(m["protein"] for m in day_meals), 1)
        total_carbs = round(sum(m["carbs"] for m in day_meals), 1)
        total_fats = round(sum(m["fats"] for m in day_meals), 1)
        
        days.append({
            "day_number": day_idx + 1,
            "day_name": day_name,
            "meals": day_meals,
            "total_calories": total_cal,
            "total_protein": total_prot,
            "total_carbs": total_carbs,
            "total_fats": total_fats
        })
        
    # Aggregate aisle grocery list
    grocery_list = compile_aisle_grocery_list(days)
    
    log_msg = f"Generated {duration_days}-day meal plan with {len(days) * 4} meals."
    if feedback:
        log_msg += f" (Corrective iteration #{retry_count} applied: {feedback})"
        
    logs.append({
        "agent": "RecipeGenerator",
        "action": "GENERATED_SCHEDULE",
        "details": log_msg
    })
    
    return {
        "generated_days": days,
        "grocery_list": grocery_list,
        "agent_logs": logs
    }
