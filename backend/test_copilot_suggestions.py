"""
Test script for AI Copilot Response Suggestions API
Tests Task 2.2 implementation
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

# You'll need a valid token - get it from the frontend after logging in as an agent
# For testing, you can use the login endpoint first
TOKEN = None

def login_as_agent():
    """Login as agent to get token"""
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "agent@intellica.com",
        "password": "agent123"
    })
    
    if response.status_code == 200:
        data = response.json()
        return data.get('access_token')
    else:
        print(f"Login failed: {response.status_code}")
        return None

def get_headers(token):
    """Get headers with auth token"""
    return {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }

def test_copilot_health(token):
    """Test 1: Check copilot health"""
    print("\n" + "="*80)
    print("TEST 1: Copilot Health Check")
    print("="*80)
    
    try:
        response = requests.get(
            f"{BASE_URL}/copilot/health",
            headers=get_headers(token)
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✓ Copilot service is healthy")
            print(f"  LLM Service: {data.get('llm_service')}")
            print(f"  Knowledge Base: {data.get('knowledge_base')}")
            print(f"  Status: {data.get('status')}")
            return True
        else:
            print(f"✗ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_ticket_summary(token, ticket_id):
    """Test 2: Get ticket summary"""
    print("\n" + "="*80)
    print(f"TEST 2: Get Ticket Summary (Ticket #{ticket_id})")
    print("="*80)
    
    try:
        response = requests.get(
            f"{BASE_URL}/copilot/tickets/{ticket_id}/summary",
            headers=get_headers(token)
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✓ Summary retrieved successfully")
            print(f"  Summary: {data.get('summary', '')[:100]}...")
            print(f"  Sentiment: {data.get('customer_sentiment')}")
            print(f"  Urgency: {data.get('urgency_level')}")
            print(f"  Confidence: {data.get('confidence_score')}")
            print(f"  Cached: {data.get('cached')}")
            return True
        else:
            print(f"✗ Failed to get summary: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_response_suggestions(token, ticket_id):
    """Test 3: Get response suggestions"""
    print("\n" + "="*80)
    print(f"TEST 3: Get Response Suggestions (Ticket #{ticket_id})")
    print("="*80)
    
    try:
        response = requests.get(
            f"{BASE_URL}/copilot/tickets/{ticket_id}/suggestions",
            headers=get_headers(token)
        )
        
        if response.status_code == 200:
            suggestions = response.json()
            print(f"✓ Retrieved {len(suggestions)} suggestions")
            
            for i, suggestion in enumerate(suggestions, 1):
                print(f"\n  Suggestion #{i}:")
                print(f"    ID: {suggestion.get('id')}")
                print(f"    Type: {suggestion.get('response_type')}")
                print(f"    Confidence: {suggestion.get('confidence_score')}")
                print(f"    Text: {suggestion.get('response_text', '')[:80]}...")
                print(f"    Reasoning: {suggestion.get('reasoning', '')[:80]}...")
                
                if suggestion.get('based_on_kb_articles'):
                    print(f"    KB Articles: {', '.join(suggestion.get('based_on_kb_articles'))}")
            
            return suggestions
        else:
            print(f"✗ Failed to get suggestions: {response.status_code}")
            print(f"  Response: {response.text}")
            return None
    except Exception as e:
        print(f"✗ Error: {e}")
        return None

def test_use_suggestion(token, suggestion_id):
    """Test 4: Submit feedback for suggestion"""
    print("\n" + "="*80)
    print(f"TEST 4: Submit Feedback for Suggestion #{suggestion_id}")
    print("="*80)
    
    try:
        feedback = {
            "modified": False,
            "rating": 5,
            "comment": "Great suggestion! Very helpful."
        }
        
        response = requests.post(
            f"{BASE_URL}/copilot/suggestions/{suggestion_id}/use",
            headers=get_headers(token),
            json=feedback
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✓ Feedback submitted successfully")
            print(f"  Message: {data.get('message')}")
            return True
        else:
            print(f"✗ Failed to submit feedback: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def main():
    print("="*80)
    print("AI COPILOT RESPONSE SUGGESTIONS TEST")
    print("Task 2.2 Implementation Verification")
    print("="*80)
    
    # Step 1: Login
    print("\nLogging in as agent...")
    token = login_as_agent()
    
    if not token:
        print("\n✗ Failed to login. Make sure backend is running.")
        print("  Start backend: cd backend && python -m uvicorn app.main:app --reload")
        return
    
    print("✓ Login successful")
    
    # Step 2: Health check
    if not test_copilot_health(token):
        print("\n⚠ Copilot service may not be fully available")
    
    # Step 3: Test with a ticket (you may need to adjust the ticket ID)
    ticket_id = "1"  # Change this to a valid ticket ID in your database
    
    # Test summary
    test_ticket_summary(token, ticket_id)
    
    # Test suggestions
    suggestions = test_response_suggestions(token, ticket_id)
    
    # Test feedback submission
    if suggestions and len(suggestions) > 0:
        suggestion_id = suggestions[0].get('id')
        test_use_suggestion(token, suggestion_id)
    
    print("\n" + "="*80)
    print("TESTING COMPLETE")
    print("="*80)
    print("\nNext steps:")
    print("  1. Start frontend: cd frontend && npm start")
    print("  2. Login as agent@intellica.com / agent123")
    print("  3. Open a ticket's communication page")
    print("  4. View AI response suggestions in the right panel")
    print("  5. Test 'Use This' button and feedback system")
    print("\n" + "="*80)

if __name__ == "__main__":
    main()
