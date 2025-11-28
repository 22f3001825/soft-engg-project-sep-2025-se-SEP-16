"""
Test cases for Supervisor API endpoints
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
        # Check if supervisor user exists
        supervisor = db.query(User).filter(User.email == "supervisor.demo@intellica.com").first()
        if not supervisor:
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

class TestSupervisorAPI:
    """Test suite for Supervisor API endpoints"""
    
    @pytest.fixture
    def supervisor_headers(self):
        """Get authentication headers for supervisor"""
        login_payload = {
            "username": "supervisor.demo@intellica.com",
            "password": "demo2024",
            "role": "SUPERVISOR"
        }
        response = client.post("/auth/login", data=login_payload)
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_supervisor_dashboard_success(self, supervisor_headers):
        """Test successful supervisor dashboard retrieval"""
        response = client.get("/api/v1/supervisor/dashboard", headers=supervisor_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "stats" in data
        assert "recent_tickets" in data
        assert "team_performance" in data
        assert "chart_data" in data
        
        # Verify stats structure
        stats = data["stats"]
        assert "total_tickets" in stats
        assert "active_agents" in stats
        assert "open_tickets" in stats
        assert "resolved_tickets" in stats
    
    def test_get_supervisor_dashboard_unauthorized(self):
        """Test supervisor dashboard access without authentication"""
        response = client.get("/api/v1/supervisor/dashboard")
        
        assert response.status_code == 401
    
    def test_get_all_tickets_success(self, supervisor_headers):
        """Test successful retrieval of all tickets"""
        response = client.get("/api/v1/supervisor/tickets", headers=supervisor_headers)
        
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
            assert "agent_name" in ticket
    
    def test_get_all_tickets_with_filters(self, supervisor_headers):
        """Test tickets retrieval with status and priority filters"""
        response = client.get("/api/v1/supervisor/tickets?status=open&priority=high", headers=supervisor_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_all_tickets_with_search(self, supervisor_headers):
        """Test tickets retrieval with search functionality"""
        response = client.get("/api/v1/supervisor/tickets?search=test", headers=supervisor_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_all_agents_success(self, supervisor_headers):
        """Test successful retrieval of all agents"""
        response = client.get("/api/v1/supervisor/agents", headers=supervisor_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # If agents exist, verify structure
        if data:
            agent = data[0]
            assert "id" in agent
            assert "name" in agent
            assert "email" in agent
            assert "assigned_tickets" in agent
            assert "resolved_tickets" in agent
            assert "department" in agent
    
    def test_get_all_agents_with_search(self, supervisor_headers):
        """Test agents retrieval with search functionality"""
        response = client.get("/api/v1/supervisor/agents?search=emma", headers=supervisor_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_all_customers_success(self, supervisor_headers):
        """Test successful retrieval of all customers"""
        response = client.get("/api/v1/supervisor/customers", headers=supervisor_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # If customers exist, verify structure
        if data:
            customer = data[0]
            assert "id" in customer
            assert "name" in customer
            assert "email" in customer
            assert "status" in customer
            assert "total_orders" in customer
            assert "total_tickets" in customer
    
    def test_get_all_customers_with_filters(self, supervisor_headers):
        """Test customers retrieval with status filter"""
        response = client.get("/api/v1/supervisor/customers?status_filter=Active Customers", headers=supervisor_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_reassign_ticket_success(self, supervisor_headers):
        """Test successful ticket reassignment"""
        # First get tickets and agents
        tickets_response = client.get("/api/v1/supervisor/tickets", headers=supervisor_headers)
        agents_response = client.get("/api/v1/supervisor/agents", headers=supervisor_headers)
        
        tickets = tickets_response.json()
        agents = agents_response.json()
        
        if tickets and agents:
            ticket_id = tickets[0]["id"]
            agent_id = agents[0]["id"]
            
            payload = {"agent_id": agent_id}
            
            response = client.put(f"/api/v1/supervisor/tickets/{ticket_id}/reassign", json=payload, headers=supervisor_headers)
            
            assert response.status_code == 200
            data = response.json()
            assert "reassigned to" in data["message"]
    
    def test_reassign_ticket_invalid_agent(self, supervisor_headers):
        """Test ticket reassignment with invalid agent ID"""
        tickets_response = client.get("/api/v1/supervisor/tickets", headers=supervisor_headers)
        tickets = tickets_response.json()
        
        if tickets:
            ticket_id = tickets[0]["id"]
            payload = {"agent_id": 99999}  # Invalid agent ID
            
            response = client.put(f"/api/v1/supervisor/tickets/{ticket_id}/reassign", json=payload, headers=supervisor_headers)
            
            assert response.status_code == 404
            assert "Agent not found" in response.json()["detail"]
    
    def test_resolve_ticket_success(self, supervisor_headers):
        """Test successful ticket resolution by supervisor"""
        tickets_response = client.get("/api/v1/supervisor/tickets", headers=supervisor_headers)
        tickets = tickets_response.json()
        
        if tickets:
            ticket_id = tickets[0]["id"]
            
            response = client.put(f"/api/v1/supervisor/tickets/{ticket_id}/resolve", headers=supervisor_headers)
            
            assert response.status_code == 200
            data = response.json()
            assert "resolved successfully" in data["message"]
    
    def test_close_ticket_success(self, supervisor_headers):
        """Test successful ticket closure by supervisor"""
        tickets_response = client.get("/api/v1/supervisor/tickets", headers=supervisor_headers)
        tickets = tickets_response.json()
        
        if tickets:
            ticket_id = tickets[0]["id"]
            
            response = client.put(f"/api/v1/supervisor/tickets/{ticket_id}/close", headers=supervisor_headers)
            
            assert response.status_code == 200
            data = response.json()
            assert "closed successfully" in data["message"]
    
    def test_update_agent_status_success(self, supervisor_headers):
        """Test successful agent status update (block/unblock)"""
        agents_response = client.get("/api/v1/supervisor/agents", headers=supervisor_headers)
        agents = agents_response.json()
        
        if agents:
            agent_id = agents[0]["id"]
            payload = {"is_active": False}  # Block agent
            
            response = client.put(f"/api/v1/supervisor/agents/{agent_id}/status", json=payload, headers=supervisor_headers)
            
            assert response.status_code == 200
            data = response.json()
            assert "blocked" in data["message"]
    
    def test_update_customer_status_success(self, supervisor_headers):
        """Test successful customer status update (block/unblock)"""
        customers_response = client.get("/api/v1/supervisor/customers", headers=supervisor_headers)
        customers = customers_response.json()
        
        if customers:
            customer_id = customers[0]["id"]
            payload = {"is_active": False}  # Block customer
            
            response = client.put(f"/api/v1/supervisor/customers/{customer_id}/status", json=payload, headers=supervisor_headers)
            
            assert response.status_code == 200
            data = response.json()
            assert "blocked" in data["message"]
    
    def test_get_analytics_success(self, supervisor_headers):
        """Test successful analytics retrieval"""
        response = client.get("/api/v1/supervisor/analytics", headers=supervisor_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "time_range" in data
        assert "ticket_stats" in data
        assert "total_tickets" in data
        assert "agent_performance" in data
    
    def test_get_analytics_with_time_range(self, supervisor_headers):
        """Test analytics retrieval with different time ranges"""
        for time_range in ["24h", "7d", "30d"]:
            response = client.get(f"/api/v1/supervisor/analytics?time_range={time_range}", headers=supervisor_headers)
            
            assert response.status_code == 200
            data = response.json()
            assert data["time_range"] == time_range