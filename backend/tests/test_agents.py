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
