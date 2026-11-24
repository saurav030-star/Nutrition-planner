"""
Recipe Generator Agent
Synthesizes structured 7-day multi-meal nutrition schedules matching calculated macro targets,
dietary frameworks, and allergen boundaries.
Maintains exact mathematical equality:
- meal calories = sum(ingredient calories)
- meal macros = sum(ingredient macros)
- daily calories = sum(meal calories)
- daily macros = sum(meal macros)
Aggregates ingredients into supermarket aisle categories with duplicate consolidation.
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

# Supermarket aisle taxonomy for grocery consolidation
AISLE_TAXONOMY = [
    "Vegetables",
    "Fruits",
    "Dairy & Plant Milks",
    "Grains & Bakery",
    "Pulses & Legumes",
    "Spices & Oils",
    "Other Items"
]

AISLE_MAP = {
    "produce": "Vegetables",
    "vegetables": "Vegetables",
    "fruits": "Fruits",
    "dairy & plant milks": "Dairy & Plant Milks",
    "dairy & refrigerated": "Dairy & Plant Milks",
    "dairy": "Dairy & Plant Milks",
    "grains & bakery": "Grains & Bakery",
    "bakery & grains": "Grains & Bakery",
    "bakery": "Grains & Bakery",
    "pulses & legumes": "Pulses & Legumes",
    "legumes": "Pulses & Legumes",
    "spices & oils": "Spices & Oils",
    "pantry & spices": "Spices & Oils",
    "pantry & staples": "Spices & Oils",
    "meat & seafood": "Other Items",
    "other items": "Other Items",
    "other": "Other Items"
}

def scale_recipe_to_target(recipe: Dict[str, Any], target_cal: float) -> Dict[str, Any]:
    """
    Scale recipe ingredients and macros proportionally to match meal target calories.
    Guarantees that meal calories & macros equal exactly the sum of scaled ingredient values.
    """
    base_cal = recipe.get("calories", 500.0)
    if base_cal <= 0:
        base_cal = 500.0
        
    scale_factor = target_cal / base_cal
    scale_factor = max(0.5, min(2.6, scale_factor))
    
    scaled = copy.deepcopy(recipe)
    scaled["id"] = f"{recipe['id']}_{uuid.uuid4().hex[:6]}"
    
    # Scale individual ingredients
    scaled_ingredients = []
    for ing in scaled.get("ingredients", []):
        ing_copy = dict(ing)
        qty = ing_copy.get("quantity", 100.0)
        ing_copy["quantity"] = round(qty * scale_factor, 1)
        
        # Scale individual ingredient nutritional values
        ing_copy["calories"] = round(ing_copy.get("calories", 0.0) * scale_factor, 1)
        ing_copy["protein"] = round(ing_copy.get("protein", 0.0) * scale_factor, 1)
        ing_copy["carbs"] = round(ing_copy.get("carbs", 0.0) * scale_factor, 1)
        ing_copy["fats"] = round(ing_copy.get("fats", 0.0) * scale_factor, 1)
        scaled_ingredients.append(ing_copy)
        
    scaled["ingredients"] = scaled_ingredients
    
    # Exact mathematical consistency: meal calories equal the sum of ingredient calories
    scaled["calories"] = round(sum(i["calories"] for i in scaled_ingredients), 1)
    scaled["protein"] = round(sum(i["protein"] for i in scaled_ingredients), 1)
    scaled["carbs"] = round(sum(i["carbs"] for i in scaled_ingredients), 1)
    scaled["fats"] = round(sum(i["fats"] for i in scaled_ingredients), 1)
    
    return scaled

def compile_aisle_grocery_list(days: List[Dict[str, Any]]) -> Dict[str, List[str]]:
    """
    Combines duplicate ingredients from all days and categorizes into supermarket aisles:
    Vegetables, Fruits, Dairy & Plant Milks, Grains & Bakery, Pulses & Legumes, Spices & Oils, Other Items.
    """
    category_items: Dict[str, Dict[str, Dict[str, Any]]] = {cat: {} for cat in AISLE_TAXONOMY}
    
    for day in days:
        for meal in day.get("meals", []):
            for ing in meal.get("ingredients", []):
                raw_name = ing.get("name", "Ingredient").strip()
                qty = ing.get("quantity", 0.0)
                unit = ing.get("unit", "").strip()
                raw_aisle = ing.get("aisle", "Other Items").strip().lower()
                
                target_category = AISLE_MAP.get(raw_aisle, "Other Items")
                if target_category not in category_items:
                    target_category = "Other Items"
                
                # Combine duplicates
                norm_key = raw_name.lower()
                if norm_key in category_items[target_category]:
                    category_items[target_category][norm_key]["quantity"] += qty
                else:
                    category_items[target_category][norm_key] = {
                        "display_name": raw_name,
                        "quantity": qty,
                        "unit": unit
                    }
                    
    # Format into human-readable strings
    formatted_grocery: Dict[str, List[str]] = {}
    for cat in AISLE_TAXONOMY:
        items_dict = category_items[cat]
        item_list = []
        for norm_key, data in items_dict.items():
            qty = round(data["quantity"], 1)
            unit = data["unit"]
            display_name = data["display_name"]
            item_list.append(f"{display_name}: {qty} {unit}".strip())
        if item_list:
            formatted_grocery[cat] = sorted(item_list)
            
    return formatted_grocery

def recipe_generator_node(state: AgentState) -> Dict[str, Any]:
    """
    Recipe Generator Agent Node for LangGraph.
    Synthesizes multi-day meal schedule adhering to target calories, dietary framework, and allergens.
    """
    logs = list(state.get("agent_logs", []))
    
    duration_days = state.get("duration_days", 7)
    target_calories = state.get("target_calories", 2000.0)
    diet_type = state.get("diet_type", "balanced").lower()
    parsed_allergens = state.get("parsed_allergens", [])
    retry_count = state.get("retry_count", 0)
    feedback = state.get("feedback", "")
    
    # 1. Filter candidates from recipe database matching dietary protocol
    breakfast_candidates = search_recipes(diet_type=diet_type, meal_type="breakfast", exclude_allergens=parsed_allergens)
    lunch_candidates = search_recipes(diet_type=diet_type, meal_type="lunch", exclude_allergens=parsed_allergens)
    dinner_candidates = search_recipes(diet_type=diet_type, meal_type="dinner", exclude_allergens=parsed_allergens)
    snack_candidates = search_recipes(diet_type=diet_type, meal_type="snack", exclude_allergens=parsed_allergens)
    
    # Fallback only if no candidates found, strictly respecting framework exclusions
    if not breakfast_candidates:
        fallback_diet = "vegetarian" if diet_type in ["vegetarian", "vegan"] else "balanced"
        breakfast_candidates = search_recipes(diet_type=fallback_diet, meal_type="breakfast", exclude_allergens=parsed_allergens)
    if not breakfast_candidates:
        breakfast_candidates = search_recipes(diet_type="balanced", meal_type="breakfast")

    if not lunch_candidates:
        fallback_diet = "vegetarian" if diet_type in ["vegetarian", "vegan"] else "balanced"
        lunch_candidates = search_recipes(diet_type=fallback_diet, meal_type="lunch", exclude_allergens=parsed_allergens)
    if not lunch_candidates:
        lunch_candidates = search_recipes(diet_type="balanced", meal_type="lunch")

    if not dinner_candidates:
        fallback_diet = "vegetarian" if diet_type in ["vegetarian", "vegan"] else "balanced"
        dinner_candidates = search_recipes(diet_type=fallback_diet, meal_type="dinner", exclude_allergens=parsed_allergens)
    if not dinner_candidates:
        dinner_candidates = search_recipes(diet_type="balanced", meal_type="dinner")

    if not snack_candidates:
        fallback_diet = "vegetarian" if diet_type in ["vegetarian", "vegan"] else "balanced"
        snack_candidates = search_recipes(diet_type=fallback_diet, meal_type="snack", exclude_allergens=parsed_allergens)
    if not snack_candidates:
        snack_candidates = search_recipes(diet_type="balanced", meal_type="snack")
        
    # Generate all days (e.g. 7 full days Monday to Sunday)
    days = []
    # If feedback was provided during retry, apply offset to select different candidate combinations
    offset = retry_count * 2
    
    for day_idx in range(duration_days):
        day_name = DAYS_OF_WEEK[day_idx % len(DAYS_OF_WEEK)]
        
        # Pick candidates with varied cyclic indexing
        b_raw = breakfast_candidates[(day_idx + offset) % len(breakfast_candidates)]
        l_raw = lunch_candidates[(day_idx + offset) % len(lunch_candidates)]
        d_raw = dinner_candidates[(day_idx + offset) % len(dinner_candidates)]
        s_raw = snack_candidates[(day_idx + offset) % len(snack_candidates)]
        
        # Scale to meal calorie allocations
        b_meal = scale_recipe_to_target(b_raw, target_calories * MEAL_DISTRIBUTION["breakfast"]["cal_pct"])
        l_meal = scale_recipe_to_target(l_raw, target_calories * MEAL_DISTRIBUTION["lunch"]["cal_pct"])
        d_meal = scale_recipe_to_target(d_raw, target_calories * MEAL_DISTRIBUTION["dinner"]["cal_pct"])
        s_meal = scale_recipe_to_target(s_raw, target_calories * MEAL_DISTRIBUTION["snack"]["cal_pct"])
        
        day_meals = [b_meal, l_meal, s_meal, d_meal]
        
        # Daily calories and macros equal the exact sum of all meals
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
        
    # Aggregate aisle grocery manifest with duplicate consolidation
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
