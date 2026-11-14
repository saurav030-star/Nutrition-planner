import pytest
from app.agents.graph import run_nutrition_pipeline
from app.agents.profile_analyzer import calculate_bmr

def test_mifflin_st_jeor_bmr():
    # Male: 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 -> 1673.8
    male_bmr = calculate_bmr(weight_kg=70.0, height_cm=175.0, age=25, gender="male")
    assert 1670.0 <= male_bmr <= 1680.0
    
    # Female: 10*60 + 6.25*165 - 5*28 - 161 = 600 + 1031.25 - 140 - 161 = 1330.25 -> 1330.2
    female_bmr = calculate_bmr(weight_kg=60.0, height_cm=165.0, age=28, gender="female")
    assert 1325.0 <= female_bmr <= 1335.0

def test_langgraph_pipeline_execution():
    input_state = {
        "age": 26,
        "gender": "male",
        "weight": 72.0,
        "height": 178.0,
        "activity_level": "moderately_active",
        "health_goal": "weight_loss",
        "diet_type": "balanced",
        "allergies": ["peanuts"],
        "duration_days": 3
    }
    
    result = run_nutrition_pipeline(input_state)
    
    assert "bmr" in result
    assert "tdee" in result
    assert "target_calories" in result
    assert "target_protein_g" in result
    assert len(result["generated_days"]) == 3
    assert result["is_valid"] is True
    assert result["confidence_score"] >= 85.0
    
    # Check that peanuts were completely excluded
    for day in result["generated_days"]:
        for meal in day["meals"]:
            assert "peanuts" not in [a.lower() for a in meal.get("allergens", [])]

def test_vegetarian_strictly_excludes_eggs():
    input_state = {
        "age": 25,
        "gender": "male",
        "weight": 70.0,
        "height": 175.0,
        "activity_level": "moderately_active",
        "health_goal": "weight_loss",
        "diet_type": "vegetarian",
        "allergies": [],
        "duration_days": 7
    }
    
    result = run_nutrition_pipeline(input_state)
    assert result["is_valid"] is True
    assert len(result["generated_days"]) == 7
    
    for day in result["generated_days"]:
        for meal in day["meals"]:
            meal_allergens = [a.lower() for a in meal.get("allergens", [])]
            assert "eggs" not in meal_allergens, f"Found eggs allergen in vegetarian meal: {meal['name']}"
            assert "egg" not in meal_allergens, f"Found egg allergen in vegetarian meal: {meal['name']}"
            assert "poached egg" not in meal["name"].lower()
            assert "omelet" not in meal["name"].lower()
            for ing in meal.get("ingredients", []):
                assert "egg" not in ing["name"].lower(), f"Found egg ingredient '{ing['name']}' in vegetarian meal '{meal['name']}'"

