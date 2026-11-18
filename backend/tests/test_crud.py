from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token():
    email = "crud_tester@nutrition.io"
    password = "SecurePassword123"
    client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "CRUD Tester"
    })
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    return res.json()["access_token"]

def test_profile_crud():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get profile
    res = client.get("/api/profile", headers=headers)
    assert res.status_code == 200
    profile = res.json()
    assert "target_calories" in profile
    
    # Update profile
    update_res = client.put("/api/profile", json={
        "weight": 78.5,
        "health_goal": "muscle_gain",
        "diet_type": "mediterranean"
    }, headers=headers)
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["weight"] == 78.5
    assert updated["health_goal"] == "muscle_gain"

def test_meal_plan_generation_and_export():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Generate 3-day meal plan
    gen_res = client.post("/api/meal-plans/generate", json={
        "duration_days": 3
    }, headers=headers)
    assert gen_res.status_code == 200
    plan = gen_res.json()
    assert len(plan["days"]) == 3
    assert plan["adherence_score"] >= 85.0
    plan_id = plan["id"]
    
    # Fetch active plan
    active_res = client.get("/api/meal-plans/active", headers=headers)
    assert active_res.status_code == 200
    assert active_res.json()["id"] == plan_id
    
    # PDF export
    pdf_res = client.get(f"/api/meal-plans/{plan_id}/pdf", headers=headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000

def test_nutrition_logging():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Post daily log
    log_res = client.post("/api/logs", json={
        "consumed_calories": 1850.0,
        "consumed_protein": 140.0,
        "consumed_carbs": 180.0,
        "consumed_fats": 60.0,
        "items": [
            {"meal_type": "breakfast", "name": "Avocado Toast", "calories": 420.0, "protein": 20.0, "carbs": 35.0, "fats": 20.0, "completed": True}
        ],
        "notes": "Feeling energized!"
    }, headers=headers)
    assert log_res.status_code == 200
    log = log_res.json()
    assert log["consumed_calories"] == 1850.0
    
    # Get logs
    get_res = client.get("/api/logs?days=7", headers=headers)
    assert get_res.status_code == 200
    logs = get_res.json()
    assert len(logs) >= 1
