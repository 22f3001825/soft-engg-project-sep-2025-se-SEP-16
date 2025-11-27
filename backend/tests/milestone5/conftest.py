"""
Configuration file for pytest test suite
Milestone 5 - API Testing
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    """Create test client for FastAPI application"""
    return TestClient(app)

@pytest.fixture
def customer_token(client):
    """Get authentication token for customer user"""
    response = client.post("/auth/login", data={
        "username": "ali.jawad@gmail.com",
        "password": "customer123",
        "role": "CUSTOMER"
    })
    return response.json()["access_token"]

@pytest.fixture
def agent_token(client):
    """Get authentication token for agent user"""
    response = client.post("/auth/login", data={
        "username": "emma.wilson@intellica.com",
        "password": "agent123",
        "role": "AGENT"
    })
    return response.json()["access_token"]

@pytest.fixture
def supervisor_token(client):
    """Get authentication token for supervisor user"""
    response = client.post("/auth/login", data={
        "username": "supervisor.demo@intellica.com",
        "password": "demo2024",
        "role": "SUPERVISOR"
    })
    return response.json()["access_token"]

@pytest.fixture
def customer_headers(customer_token):
    """Get authorization headers for customer"""
    return {"Authorization": f"Bearer {customer_token}"}

@pytest.fixture
def agent_headers(agent_token):
    """Get authorization headers for agent"""
    return {"Authorization": f"Bearer {agent_token}"}

@pytest.fixture
def supervisor_headers(supervisor_token):
    """Get authorization headers for supervisor"""
    return {"Authorization": f"Bearer {supervisor_token}"}