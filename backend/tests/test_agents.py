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

def test_vegetarian_strictly_excludes_eggs_and_meat():
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
    
    forbidden = ["egg", "eggs", "chicken", "beef", "turkey", "pork", "fish", "salmon", "tuna", "seafood", "shrimp", "bacon"]
    
    for day in result["generated_days"]:
        assert len(day["meals"]) == 4, "Each day must have 4 meals (Breakfast, Lunch, Dinner, Snack)"
        for meal in day["meals"]:
            meal_allergens = [a.lower() for a in meal.get("allergens", [])]
            assert "eggs" not in meal_allergens
            assert "egg" not in meal_allergens
            assert "fish" not in meal_allergens
            assert "shellfish" not in meal_allergens
            
            meal_name_lower = meal["name"].lower()
            for f in forbidden:
                assert f not in meal_name_lower, f"Forbidden word '{f}' in meal name: {meal['name']}"
                
            for ing in meal.get("ingredients", []):
                ing_lower = ing["name"].lower()
                for f in forbidden:
                    assert f not in ing_lower, f"Forbidden word '{f}' in ingredient '{ing['name']}' of meal '{meal['name']}'"

def test_mathematical_consistency():
    """
    Verifies that:
    1. Meal calories equal sum of ingredient calories.
    2. Daily calories equal sum of all meals.
    3. Daily macros equal sum of all meals.
    """
    input_state = {
        "age": 30,
        "gender": "female",
        "weight": 65.0,
        "height": 165.0,
        "activity_level": "moderately_active",
        "health_goal": "maintenance",
        "diet_type": "vegetarian",
        "duration_days": 7
    }
    
    result = run_nutrition_pipeline(input_state)
    assert result["is_valid"] is True
    
    for day in result["generated_days"]:
        meals = day["meals"]
        # Check meal-level ingredient sum
        for meal in meals:
            sum_cal = round(sum(i.get("calories", 0.0) for i in meal["ingredients"]), 1)
            sum_p = round(sum(i.get("protein", 0.0) for i in meal["ingredients"]), 1)
            sum_c = round(sum(i.get("carbs", 0.0) for i in meal["ingredients"]), 1)
            sum_f = round(sum(i.get("fats", 0.0) for i in meal["ingredients"]), 1)
            
            assert abs(meal["calories"] - sum_cal) <= 0.1, f"Meal cal {meal['calories']} != ingredient sum {sum_cal}"
            assert abs(meal["protein"] - sum_p) <= 0.1, f"Meal prot {meal['protein']} != ingredient sum {sum_p}"
            assert abs(meal["carbs"] - sum_c) <= 0.1, f"Meal carbs {meal['carbs']} != ingredient sum {sum_c}"
            assert abs(meal["fats"] - sum_f) <= 0.1, f"Meal fats {meal['fats']} != ingredient sum {sum_f}"
            
        # Check day-level meal sum
        day_cal_sum = round(sum(m["calories"] for m in meals), 1)
        day_p_sum = round(sum(m["protein"] for m in meals), 1)
        day_c_sum = round(sum(m["carbs"] for m in meals), 1)
        day_f_sum = round(sum(m["fats"] for m in meals), 1)
        
        assert abs(day["total_calories"] - day_cal_sum) <= 0.1, f"Day cal {day['total_calories']} != meal sum {day_cal_sum}"
        assert abs(day["total_protein"] - day_p_sum) <= 0.1, f"Day prot {day['total_protein']} != meal sum {day_p_sum}"
        assert abs(day["total_carbs"] - day_c_sum) <= 0.1, f"Day carbs {day['total_carbs']} != meal sum {day_c_sum}"
        assert abs(day["total_fats"] - day_f_sum) <= 0.1, f"Day fats {day['total_fats']} != meal sum {day_f_sum}"

def test_seven_day_schedule_navigation():
    input_state = {
        "age": 25,
        "gender": "male",
        "weight": 70.0,
        "height": 175.0,
        "activity_level": "moderately_active",
        "health_goal": "weight_loss",
        "diet_type": "vegetarian",
        "duration_days": 7
    }
    result = run_nutrition_pipeline(input_state)
    days = result["generated_days"]
    assert len(days) == 7
    expected_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    for idx, expected in enumerate(expected_days):
        assert days[idx]["day_name"] == expected
        assert days[idx]["day_number"] == idx + 1
        assert len(days[idx]["meals"]) == 4
