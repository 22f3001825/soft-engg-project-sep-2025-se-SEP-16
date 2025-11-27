"""
Test cases for Customer API endpoints
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
        # Check if customer user exists
        customer = db.query(User).filter(User.email == "ali.jawad@gmail.com").first()
        if not customer:
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

class TestCustomerAPI:
    """Test suite for Customer API endpoints"""
    
    @pytest.fixture
    def customer_headers(self):
        """Get authentication headers for customer"""
        login_payload = {
            "username": "ali.jawad@gmail.com",
            "password": "customer123",
            "role": "CUSTOMER"
        }
        response = client.post("/auth/login", data=login_payload)
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_dashboard_success(self, customer_headers):
        """Test successful dashboard retrieval"""
        response = client.get("/api/v1/customer/dashboard", headers=customer_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "stats" in data
        assert "charts" in data
        assert "recent_orders" in data
        assert "recent_tickets" in data
        
        # Verify stats structure
        stats = data["stats"]
        assert "open_tickets" in stats
        assert "active_orders" in stats
        assert "resolved_tickets" in stats
    
    def test_get_dashboard_unauthorized(self):
        """Test dashboard access without authentication"""
        response = client.get("/api/v1/customer/dashboard")
        
        assert response.status_code == 401
    
    def test_get_orders_success(self, customer_headers):
        """Test successful orders retrieval"""
        response = client.get("/api/v1/customer/orders", headers=customer_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # If orders exist, verify structure
        if data:
            order = data[0]
            assert "id" in order
            assert "status" in order
            assert "total" in order
            assert "items" in order
    
    def test_get_orders_with_status_filter(self, customer_headers):
        """Test orders retrieval with status filter"""
        response = client.get("/api/v1/customer/orders?status=delivered", headers=customer_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_order_details_success(self, customer_headers):
        """Test successful order details retrieval"""
        # First get orders to find a valid order ID
        orders_response = client.get("/api/v1/customer/orders", headers=customer_headers)
        orders = orders_response.json()
        
        if orders:
            order_id = orders[0]["id"]
            response = client.get(f"/api/v1/customer/orders/{order_id}", headers=customer_headers)
            
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == order_id
            assert "items" in data
            assert "tracking" in data
    
    def test_get_order_details_not_found(self, customer_headers):
        """Test order details for non-existent order"""
        response = client.get("/api/v1/customer/orders/INVALID_ORDER_ID", headers=customer_headers)
        
        assert response.status_code == 404
        assert "Order not found" in response.json()["detail"]
    
    def test_create_ticket_success(self, customer_headers):
        """Test successful ticket creation"""
        payload = {
            "subject": "Test Support Ticket",
            "description": "This is a test ticket for API testing",
            "priority": "MEDIUM",
            "order_id": None
        }
        
        response = client.post("/api/v1/customer/tickets", json=payload, headers=customer_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "ticket_id" in data
        assert "message" in data
        assert data["message"] == "Ticket created successfully"
    
    def test_create_ticket_missing_subject(self, customer_headers):
        """Test ticket creation with missing subject"""
        payload = {
            "description": "This is a test ticket for API testing",
            "priority": "MEDIUM"
        }
        
        response = client.post("/api/v1/customer/tickets", json=payload, headers=customer_headers)
        
        assert response.status_code == 422  # Validation error
    
    def test_get_tickets_success(self, customer_headers):
        """Test successful tickets retrieval"""
        response = client.get("/api/v1/customer/tickets", headers=customer_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # If tickets exist, verify structure
        if data:
            ticket = data[0]
            assert "id" in ticket
            assert "subject" in ticket
            assert "status" in ticket
            assert "priority" in ticket
    
    def test_get_profile_success(self, customer_headers):
        """Test successful profile retrieval"""
        response = client.get("/api/v1/customer/profile", headers=customer_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        assert "full_name" in data
        assert "total_orders" in data
        assert "total_tickets" in data
    
    def test_update_profile_success(self, customer_headers):
        """Test successful profile update"""
        payload = {
            "full_name": "Updated Test Name",
            "preferences": {
                "notifications": {
                    "email": True,
                    "order_updates": False
                }
            }
        }
        
        response = client.put("/api/v1/customer/profile", json=payload, headers=customer_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Profile updated successfully"
    
    def test_get_notifications_success(self, customer_headers):
        """Test successful notifications retrieval"""
        response = client.get("/api/v1/customer/notifications", headers=customer_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # If notifications exist, verify structure
        if data:
            notification = data[0]
            assert "id" in notification
            assert "title" in notification
            assert "message" in notification
            assert "read" in notification
    
    def test_get_notifications_unread_only(self, customer_headers):
        """Test notifications retrieval with unread filter"""
        response = client.get("/api/v1/customer/notifications?unread_only=true", headers=customer_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)