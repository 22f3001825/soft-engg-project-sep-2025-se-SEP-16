"""
Test cases for Authentication API endpoints
Milestone 5 - API Testing Suite
"""
import pytest
import json
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User

# Ensure database is seeded before creating test client
def ensure_test_data():
    """Ensure test users exist in database"""
    db = SessionLocal()
    try:
        # Check if test user exists
        user = db.query(User).filter(User.email == "ali.jawad@gmail.com").first()
        if not user:
            # Run seed script
            import subprocess
            import os
            backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            subprocess.run(["python", "create_medium_seed.py"], cwd=backend_dir, check=True)
    except Exception as e:
        print(f"Database seeding failed: {e}")
    finally:
        db.close()

# Ensure data exists before creating client
ensure_test_data()
client = TestClient(app)

class TestAuthAPI:
    """Test suite for Authentication API endpoints"""
    
    def test_user_registration_success(self):
        """Test successful user registration"""
        import uuid
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        payload = {
            "email": unique_email,
            "password": "testpass123",
            "full_name": "Test User",
            "role": "CUSTOMER"
        }
        
        response = client.post("/auth/register", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == unique_email
    
    def test_user_registration_duplicate_email(self):
        """Test registration with duplicate email"""
        payload = {
            "email": "ali.jawad@gmail.com",  # Pre-seeded email
            "password": "testpass123",
            "full_name": "Test User",
            "role": "CUSTOMER"
        }
        
        response = client.post("/auth/register", json=payload)
        
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]
    
    def test_user_login_success(self):
        """Test successful user login"""
        payload = {
            "username": "ali.jawad@gmail.com",
            "password": "customer123",
            "role": "CUSTOMER"
        }
        
        response = client.post("/auth/login", data=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "ali.jawad@gmail.com"
    
    def test_user_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        payload = {
            "username": "invalid@example.com",
            "password": "wrongpassword",
            "role": "CUSTOMER"
        }
        
        response = client.post("/auth/login", data=payload)
        
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]
    
    def test_user_login_invalid_role(self):
        """Test login with invalid role"""
        payload = {
            "username": "ali.jawad@gmail.com",
            "password": "customer123",
            "role": "INVALID_ROLE"
        }
        
        response = client.post("/auth/login", data=payload)
        
        assert response.status_code == 400
        assert "Invalid role specified" in response.json()["detail"]
    
    def test_get_current_user_success(self):
        """Test getting current user info with valid token"""
        # First login to get token
        login_payload = {
            "username": "ali.jawad@gmail.com",
            "password": "customer123",
            "role": "CUSTOMER"
        }
        login_response = client.post("/auth/login", data=login_payload)
        token = login_response.json()["access_token"]
        
        # Get current user info
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "ali.jawad@gmail.com"
        assert data["role"] == "CUSTOMER"
    
    def test_get_current_user_invalid_token(self):
        """Test getting current user info with invalid token"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/auth/me", headers=headers)
        
        assert response.status_code == 401

@pytest.fixture
def auth_headers():
    """Fixture to provide authentication headers"""
    login_payload = {
        "username": "ali.jawad@gmail.com",
        "password": "customer123",
        "role": "CUSTOMER"
    }
    response = client.post("/auth/login", data=login_payload)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}