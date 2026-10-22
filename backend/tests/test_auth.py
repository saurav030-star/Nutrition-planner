from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_register_and_login():
    email = "testuser_auth@nutrition.io"
    password = "SuperSecretPassword123"
    
    # Register
    reg_response = client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Test User"
    })
    assert reg_response.status_code in [201, 400]
    
    # Login
    login_response = client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_response.status_code == 200
    data = login_response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    
    token = data["access_token"]
    
    # Get current user /me
    me_response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    assert me_response.json()["email"] == email
