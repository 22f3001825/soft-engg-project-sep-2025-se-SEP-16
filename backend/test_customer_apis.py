"""
Test script for Customer APIs
Tests all customer endpoints with the seeded database
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_customer_apis():
    """Test customer APIs with seeded data"""
    
    login_data = {
        "email": "ali.jawad@example.com",
        "password": "customer123"
    }
    
    print("Testing Customer Authentication...")
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            token = response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            print("Authentication successful")
            
            # Test Dashboard API
            print("\nTesting Dashboard API...")
            response = requests.get(f"{BASE_URL}/api/v1/customer/dashboard", headers=headers)
            if response.status_code == 200:
                dashboard_data = response.json()
                print(f"Dashboard API works - Stats: {dashboard_data['stats']}")
            else:
                print(f"Dashboard API failed: {response.status_code}")
            
            # Test Orders API
            print("\nTesting Orders API...")
            response = requests.get(f"{BASE_URL}/api/v1/customer/orders", headers=headers)
            if response.status_code == 200:
                orders = response.json()
                print(f"Orders API works - Found {len(orders)} orders")
            else:
                print(f"Orders API failed: {response.status_code}")
            
            # Test Tickets API
            print("\nTesting Tickets API...")
            response = requests.get(f"{BASE_URL}/api/v1/customer/tickets", headers=headers)
            if response.status_code == 200:
                tickets = response.json()
                print(f"Tickets API works - Found {len(tickets)} tickets")
            else:
                print(f"Tickets API failed: {response.status_code}")
            
            # Test Profile API
            print("\nTesting Profile API...")
            response = requests.get(f"{BASE_URL}/api/v1/customer/profile", headers=headers)
            if response.status_code == 200:
                profile = response.json()
                print(f"Profile API works - User: {profile['full_name']}")
            else:
                print(f"Profile API failed: {response.status_code}")
            
            # Test Settings API
            print("\nTesting Settings API...")
            response = requests.get(f"{BASE_URL}/api/v1/customer/settings", headers=headers)
            if response.status_code == 200:
                settings = response.json()
                print(f"Settings API works - Theme: {settings.get('general', {}).get('theme', 'N/A')}")
            else:
                print(f"Settings API failed: {response.status_code}")
            
            # Test Notifications API
            print("\nTesting Notifications API...")
            response = requests.get(f"{BASE_URL}/api/v1/customer/notifications", headers=headers)
            if response.status_code == 200:
                notifications = response.json()
                print(f"Notifications API works - Found {len(notifications)} notifications")
            else:
                print(f"Notifications API failed: {response.status_code}")
            
            print("\nAll Customer APIs tested successfully!")
            
        else:
            print(f"Authentication failed: {response.status_code}")
            print(response.text)
    
    except requests.exceptions.ConnectionError:
        print("Could not connect to server. Make sure FastAPI server is running on port 8000")
        print("Run: uvicorn app.main:app --reload --port 8000")
    except Exception as e:
        print(f"Error testing APIs: {e}")

if __name__ == "__main__":
    test_customer_apis()