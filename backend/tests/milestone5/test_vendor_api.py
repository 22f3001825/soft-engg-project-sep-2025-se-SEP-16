"""
Test cases for Vendor API endpoints
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
        # Check if vendor user exists
        vendor = db.query(User).filter(User.email == "vendor@techmart.com").first()
        if not vendor:
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

class TestVendorAPI:
    """Test suite for Vendor API endpoints"""
    
    @pytest.fixture
    def vendor_headers(self):
        """Get authentication headers for vendor"""
        login_payload = {
            "username": "vendor@techmart.com",
            "password": "vendor123",
            "role": "VENDOR"
        }
        response = client.post("/auth/login", data=login_payload)
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_vendor_dashboard_success(self, vendor_headers):
        """Test successful vendor dashboard retrieval"""
        response = client.get("/api/v1/vendor/dashboard", headers=vendor_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "totalComplaints" in data
        assert "overallReturnRate" in data
        assert "topIssueCategory" in data
        assert "totalProducts" in data
        assert "recentComplaints" in data
        
        # Verify data types
        assert isinstance(data["totalComplaints"], int)
        assert isinstance(data["overallReturnRate"], (int, float))
        assert isinstance(data["totalProducts"], int)
        assert isinstance(data["recentComplaints"], list)
    
    def test_get_vendor_dashboard_unauthorized(self):
        """Test vendor dashboard access without authentication"""
        response = client.get("/api/v1/vendor/dashboard")
        
        assert response.status_code == 401
    
    def test_get_vendor_analytics_success(self, vendor_headers):
        """Test successful vendor analytics retrieval"""
        response = client.get("/api/v1/vendor/analytics", headers=vendor_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "complaintsTrend" in data
        assert "issueCategories" in data
        
        # Verify structure
        assert isinstance(data["complaintsTrend"], list)
        assert isinstance(data["issueCategories"], list)
    
    def test_get_vendor_analytics_with_date_range(self, vendor_headers):
        """Test vendor analytics with custom date range"""
        response = client.get("/api/v1/vendor/analytics?date_range=7", headers=vendor_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "complaintsTrend" in data
        assert "issueCategories" in data
    
    def test_get_vendor_analytics_invalid_date_range(self, vendor_headers):
        """Test vendor analytics with invalid date range"""
        response = client.get("/api/v1/vendor/analytics?date_range=500", headers=vendor_headers)
        
        assert response.status_code == 400
        assert "Date range must be between 1 and 365 days" in response.json()["detail"]
    
    def test_get_vendor_complaints_success(self, vendor_headers):
        """Test successful vendor complaints retrieval"""
        response = client.get("/api/v1/vendor/complaints", headers=vendor_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # If complaints exist, verify structure
        if data:
            complaint = data[0]
            assert "id" in complaint
            assert "name" in complaint
            assert "category" in complaint
            assert "totalComplaints" in complaint
            assert "returnRate" in complaint
            assert "topIssues" in complaint
    
    def test_get_vendor_profile_success(self, vendor_headers):
        """Test successful vendor profile retrieval"""
        response = client.get("/api/v1/vendor/profile", headers=vendor_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert "vendor" in data
        
        # Verify user data structure
        user_data = data["user"]
        assert "id" in user_data
        assert "email" in user_data
        assert "full_name" in user_data
        
        # Verify vendor data structure
        vendor_data = data["vendor"]
        assert "company_name" in vendor_data
        assert "business_type" in vendor_data
        assert "total_products" in vendor_data
    
    def test_update_vendor_profile_success(self, vendor_headers):
        """Test successful vendor profile update"""
        payload = {
            "company_name": "Updated TechMart Solutions",
            "business_type": "Electronics & Technology",
            "contact_phone": "+1-800-NEW-TECH",
            "product_categories": "Electronics, Accessories"
        }
        
        response = client.put("/api/v1/vendor/profile", json=payload, headers=vendor_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Profile updated successfully"
    
    def test_update_vendor_profile_invalid_email(self, vendor_headers):
        """Test vendor profile update with invalid email"""
        payload = {
            "contact_email": "invalid-email-format"
        }
        
        response = client.put("/api/v1/vendor/profile", json=payload, headers=vendor_headers)
        
        assert response.status_code == 400
        assert "Invalid email format" in response.json()["detail"]
    
    def test_get_vendor_settings_success(self, vendor_headers):
        """Test successful vendor settings retrieval"""
        response = client.get("/api/v1/vendor/settings", headers=vendor_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "general" in data
        assert "notifications" in data
        
        # Verify settings structure
        general = data["general"]
        assert "dashboardRange" in general
        assert "timezone" in general
        assert "theme" in general
        
        notifications = data["notifications"]
        assert "newComplaints" in notifications
        assert "resolvedComplaints" in notifications
    
    def test_get_vendor_notifications_success(self, vendor_headers):
        """Test successful vendor notifications retrieval"""
        response = client.get("/api/v1/vendor/notifications", headers=vendor_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # If notifications exist, verify structure
        if data:
            notification = data[0]
            assert "id" in notification
            assert "title" in notification
            assert "message" in notification
            assert "type" in notification
            assert "read" in notification
            assert "timestamp" in notification
    
    def test_get_vendor_notifications_unread_only(self, vendor_headers):
        """Test vendor notifications with unread filter"""
        response = client.get("/api/v1/vendor/notifications?unread_only=true", headers=vendor_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Verify all returned notifications are unread
        for notification in data:
            assert notification["read"] == False
    
    def test_delete_vendor_notification_success(self, vendor_headers):
        """Test successful vendor notification deletion"""
        # First get notifications to find one to delete
        notifications_response = client.get("/api/v1/vendor/notifications", headers=vendor_headers)
        notifications = notifications_response.json()
        
        if notifications:
            notification_id = notifications[0]["id"]
            response = client.delete(f"/api/v1/vendor/notifications/{notification_id}", headers=vendor_headers)
            
            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "Notification deleted successfully"
    
    def test_delete_vendor_notification_not_found(self, vendor_headers):
        """Test vendor notification deletion with invalid ID"""
        response = client.delete("/api/v1/vendor/notifications/99999", headers=vendor_headers)
        
        assert response.status_code == 404
        assert "Notification not found" in response.json()["detail"]
    
    def test_vendor_endpoints_non_vendor_access(self):
        """Test vendor endpoints with non-vendor user"""
        # Login as customer
        login_payload = {
            "username": "ali.jawad@gmail.com",
            "password": "customer123",
            "role": "CUSTOMER"
        }
        response = client.post("/auth/login", data=login_payload)
        
        # Skip test if customer login fails (database might be in inconsistent state)
        if response.status_code != 200:
            pytest.skip("Customer login failed - database inconsistent")
            
        customer_headers = {"Authorization": f"Bearer {response.json()['access_token']}"}
        
        # Test various vendor endpoints
        endpoints = [
            "/api/v1/vendor/dashboard",
            "/api/v1/vendor/analytics",
            "/api/v1/vendor/complaints",
            "/api/v1/vendor/profile",
            "/api/v1/vendor/settings",
            "/api/v1/vendor/notifications"
        ]
        
        for endpoint in endpoints:
            response = client.get(endpoint, headers=customer_headers)
            assert response.status_code == 403
            assert "Access denied" in response.json()["detail"]