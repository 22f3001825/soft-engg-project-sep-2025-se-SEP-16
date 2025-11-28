"""
Test cases for Agent API endpoints
Milestone 5 - API Testing Suite
"""
import pytest
import json
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User

client = TestClient(app)

# Run seeding for test environment
try:
    import subprocess
    import os
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    subprocess.run(["python", "create_medium_seed.py"], cwd=backend_dir, check=True, capture_output=True)
except:
    pass

class TestAgentAPI:
    """Test suite for Agent API endpoints"""
    
    @pytest.fixture
    def agent_headers(self):
        """Get authentication headers for agent"""
        login_payload = {
            "username": "emma.wilson@intellica.com",
            "password": "agent123",
            "role": "AGENT"
        }
        response = client.post("/auth/login", data=login_payload)
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_agent_dashboard_success(self, agent_headers):
        """Test successful agent dashboard retrieval"""
        response = client.get("/api/v1/agent/dashboard", headers=agent_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "stats" in data
        assert "recent_tickets" in data
        
        # Verify stats structure
        stats = data["stats"]
        assert "available_tickets" in stats
        assert "assigned_to_me" in stats
        assert "high_priority" in stats
        assert "overdue" in stats
    
    def test_get_agent_dashboard_unauthorized(self):
        """Test agent dashboard access without authentication"""
        response = client.get("/api/v1/agent/dashboard")
        
        assert response.status_code == 401
    
    def test_get_tickets_success(self, agent_headers):
        """Test successful tickets retrieval for agent"""
        response = client.get("/api/v1/agent/tickets", headers=agent_headers)
        
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
            assert "customer_name" in ticket
    
    def test_get_tickets_with_filters(self, agent_headers):
        """Test tickets retrieval with status and priority filters"""
        response = client.get("/api/v1/agent/tickets?status=open&priority=high", headers=agent_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_tickets_assigned_only(self, agent_headers):
        """Test tickets retrieval for assigned tickets only"""
        response = client.get("/api/v1/agent/tickets?assigned_only=true", headers=agent_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_ticket_details_success(self, agent_headers):
        """Test successful ticket details retrieval"""
        # First get tickets to find a valid ticket ID
        tickets_response = client.get("/api/v1/agent/tickets", headers=agent_headers)
        tickets = tickets_response.json()
        
        if tickets:
            ticket_id = tickets[0]["id"]
            response = client.get(f"/api/v1/agent/tickets/{ticket_id}", headers=agent_headers)
            
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == ticket_id
            assert "customer" in data
            assert "messages" in data
    
    def test_assign_ticket_success(self, agent_headers):
        """Test successful ticket assignment"""
        # First get tickets to find an unassigned ticket
        tickets_response = client.get("/api/v1/agent/tickets", headers=agent_headers)
        tickets = tickets_response.json()
        
        if tickets:
            ticket_id = tickets[0]["id"]
            payload = {"agent_id": None}  # Assign to current agent
            
            response = client.put(f"/api/v1/agent/tickets/{ticket_id}/assign", json=payload, headers=agent_headers)
            
            assert response.status_code == 200
            data = response.json()
            assert "assigned successfully" in data["message"]
    
    def test_update_ticket_status_success(self, agent_headers):
        """Test successful ticket status update"""
        # First get tickets to find a ticket to update
        tickets_response = client.get("/api/v1/agent/tickets", headers=agent_headers)
        tickets = tickets_response.json()
        
        if tickets:
            ticket_id = tickets[0]["id"]
            payload = {"status": "IN_PROGRESS"}
            
            response = client.put(f"/api/v1/agent/tickets/{ticket_id}/status", json=payload, headers=agent_headers)
            
            assert response.status_code == 200
            data = response.json()
            assert "status updated successfully" in data["message"]
    
    def test_update_ticket_status_invalid(self, agent_headers):
        """Test ticket status update with invalid status"""
        tickets_response = client.get("/api/v1/agent/tickets", headers=agent_headers)
        tickets = tickets_response.json()
        
        if tickets:
            ticket_id = tickets[0]["id"]
            payload = {"status": "INVALID_STATUS"}
            
            response = client.put(f"/api/v1/agent/tickets/{ticket_id}/status", json=payload, headers=agent_headers)
            
            assert response.status_code == 400
            assert "Invalid status value" in response.json()["detail"]
    
    def test_add_ticket_message_success(self, agent_headers):
        """Test successful message addition to ticket"""
        # First get tickets to find a ticket
        tickets_response = client.get("/api/v1/agent/tickets", headers=agent_headers)
        tickets = tickets_response.json()
        
        if tickets:
            ticket_id = tickets[0]["id"]
            payload = {
                "content": "This is a test message from agent",
                "is_internal": False
            }
            
            response = client.post(f"/api/v1/agent/tickets/{ticket_id}/messages", json=payload, headers=agent_headers)
            
            assert response.status_code == 200
            data = response.json()
            assert "Message added successfully" in data["message"]
    
    def test_add_internal_message_success(self, agent_headers):
        """Test successful internal message addition"""
        tickets_response = client.get("/api/v1/agent/tickets", headers=agent_headers)
        tickets = tickets_response.json()
        
        if tickets:
            ticket_id = tickets[0]["id"]
            payload = {
                "content": "This is an internal note",
                "is_internal": True
            }
            
            response = client.post(f"/api/v1/agent/tickets/{ticket_id}/messages", json=payload, headers=agent_headers)
            
            assert response.status_code == 200
            data = response.json()
            assert "Message added successfully" in data["message"]
    
    def test_resolve_ticket_success(self, agent_headers):
        """Test successful ticket resolution"""
        tickets_response = client.get("/api/v1/agent/tickets", headers=agent_headers)
        tickets = tickets_response.json()
        
        if tickets:
            ticket_id = tickets[0]["id"]
            
            response = client.put(f"/api/v1/agent/tickets/{ticket_id}/resolve", headers=agent_headers)
            
            assert response.status_code == 200
            data = response.json()
            assert "resolved successfully" in data["message"]
    
    def test_approve_refund_success(self, agent_headers):
        """Test successful refund approval"""
        tickets_response = client.get("/api/v1/agent/tickets", headers=agent_headers)
        tickets = tickets_response.json()
        
        if tickets:
            ticket_id = tickets[0]["id"]
            payload = {
                "amount": 99.99,
                "reason": "Product defect confirmed"
            }
            
            response = client.post(f"/api/v1/agent/tickets/{ticket_id}/refund/approve", json=payload, headers=agent_headers)
            
            assert response.status_code == 200
            data = response.json()
            assert "approved successfully" in data["message"]
    
    def test_reject_refund_success(self, agent_headers):
        """Test successful refund rejection"""
        tickets_response = client.get("/api/v1/agent/tickets", headers=agent_headers)
        tickets = tickets_response.json()
        
        if tickets:
            ticket_id = tickets[0]["id"]
            payload = {
                "reason": "Does not meet return policy requirements"
            }
            
            response = client.post(f"/api/v1/agent/tickets/{ticket_id}/refund/reject", json=payload, headers=agent_headers)
            
            assert response.status_code == 200
            data = response.json()
            assert "rejected successfully" in data["message"]
    
    def test_get_customers_success(self, agent_headers):
        """Test successful customers retrieval"""
        response = client.get("/api/v1/agent/customers", headers=agent_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # If customers exist, verify structure
        if data:
            customer = data[0]
            assert "id" in customer
            assert "name" in customer
            assert "email" in customer
            assert "total_orders" in customer
            assert "total_tickets" in customer