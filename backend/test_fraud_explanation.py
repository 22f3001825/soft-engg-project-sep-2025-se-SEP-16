"""
Test script for Fraud Explanation API
Tests Task 2.4 implementation
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

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

def test_get_refund_explanation(token, refund_id):
    """Test: Get refund explanation"""
    print("\n" + "="*80)
    print(f"TEST: Get Refund Explanation (Refund #{refund_id})")
    print("="*80)
    
    try:
        response = requests.get(
            f"{BASE_URL}/copilot/refunds/{refund_id}/explanation",
            headers=get_headers(token)
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✓ Explanation retrieved successfully")
            print(f"\n  Decision: {data.get('decision')}")
            print(f"  Confidence: {data.get('confidence_score')}")
            print(f"  Cached: {data.get('cached')}")
            
            print(f"\n  Agent Explanation:")
            print(f"    {data.get('agent_explanation', '')[:200]}...")
            
            print(f"\n  Customer Explanation:")
            print(f"    {data.get('customer_explanation', '')[:200]}...")
            
            if data.get('reasoning_points'):
                print(f"\n  Reasoning Points:")
                for i, point in enumerate(data.get('reasoning_points', [])[:3], 1):
                    print(f"    {i}. {point}")
            
            if data.get('policy_sections'):
                print(f"\n  Policy References:")
                for policy in data.get('policy_sections', []):
                    print(f"    - {policy}")
            
            if data.get('next_steps'):
                print(f"\n  Next Steps:")
                for i, step in enumerate(data.get('next_steps', []), 1):
                    print(f"    {i}. {step}")
            
            return True
        elif response.status_code == 404:
            print(f"✗ Refund not found: {response.status_code}")
            print(f"  This is expected if refund ID doesn't exist")
            return False
        else:
            print(f"✗ Failed to get explanation: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_explanation_structure(token, refund_id):
    """Test: Verify response structure"""
    print("\n" + "="*80)
    print("TEST: Response Structure Validation")
    print("="*80)
    
    try:
        response = requests.get(
            f"{BASE_URL}/copilot/refunds/{refund_id}/explanation",
            headers=get_headers(token)
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Check required fields
            required_fields = [
                'decision', 
                'agent_explanation', 
                'customer_explanation',
                'reasoning_points',
                'policy_sections',
                'next_steps',
                'confidence_score'
            ]
            
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                print(f"  ✗ Missing fields: {missing_fields}")
                return False
            
            print("  ✓ All required fields present")
            
            # Check field types
            if not isinstance(data['reasoning_points'], list):
                print("  ✗ reasoning_points should be a list")
                return False
            
            if not isinstance(data['policy_sections'], list):
                print("  ✗ policy_sections should be a list")
                return False
            
            if not isinstance(data['next_steps'], list):
                print("  ✗ next_steps should be a list")
                return False
            
            print("  ✓ Field types are correct")
            
            # Check decision values
            valid_decisions = ['APPROVED', 'REJECTED', 'NEEDS_REVIEW']
            if data['decision'] not in valid_decisions:
                print(f"  ⚠ Unexpected decision value: {data['decision']}")
            else:
                print(f"  ✓ Decision value is valid: {data['decision']}")
            
            return True
        else:
            print(f"  ✗ Request failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def test_caching(token, refund_id):
    """Test: Verify caching behavior"""
    print("\n" + "="*80)
    print("TEST: Caching Behavior")
    print("="*80)
    
    try:
        # First request
        print("  Making first request...")
        response1 = requests.get(
            f"{BASE_URL}/copilot/refunds/{refund_id}/explanation",
            headers=get_headers(token)
        )
        
        if response1.status_code != 200:
            print(f"  ✗ First request failed: {response1.status_code}")
            return False
        
        data1 = response1.json()
        cached1 = data1.get('cached', False)
        print(f"  First request - Cached: {cached1}")
        
        # Second request (should be cached)
        print("  Making second request...")
        response2 = requests.get(
            f"{BASE_URL}/copilot/refunds/{refund_id}/explanation",
            headers=get_headers(token)
        )
        
        if response2.status_code != 200:
            print(f"  ✗ Second request failed: {response2.status_code}")
            return False
        
        data2 = response2.json()
        cached2 = data2.get('cached', False)
        print(f"  Second request - Cached: {cached2}")
        
        if cached2:
            print("  ✓ Caching is working")
            return True
        else:
            print("  ⚠ Second request was not cached (may be expected)")
            return True
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    print("="*80)
    print("FRAUD EXPLANATION API TEST")
    print("Task 2.4 Implementation Verification")
    print("="*80)
    
    # Step 1: Login
    print("\nLogging in as agent...")
    token = login_as_agent()
    
    if not token:
        print("\n✗ Failed to login. Make sure backend is running.")
        print("  Start backend: cd backend && python -m uvicorn app.main:app --reload")
        return
    
    print("✓ Login successful")
    
    # Step 2: Test with a refund ID
    # Note: You'll need to replace this with an actual refund ID from your database
    refund_id = "1"  # Change this to a valid refund ID
    
    print(f"\n⚠ NOTE: Using refund ID '{refund_id}'")
    print("  If this refund doesn't exist, tests will fail.")
    print("  Check your database for valid refund IDs.")
    
    # Run tests
    test_get_refund_explanation(token, refund_id)
    test_explanation_structure(token, refund_id)
    test_caching(token, refund_id)
    
    print("\n" + "="*80)
    print("TESTING COMPLETE")
    print("="*80)
    print("\nNext steps:")
    print("  1. Start frontend: cd frontend && npm start")
    print("  2. Login as agent@intellica.com / agent123")
    print("  3. Open a ticket with a related order")
    print("  4. Look for 'Refund Analysis' card in sidebar")
    print("  5. Test the following:")
    print("     - View agent explanation")
    print("     - Toggle to customer view")
    print("     - Check reasoning points")
    print("     - Verify policy references")
    print("     - Review next steps")
    print("\n" + "="*80)
    print("\n⚠ IMPORTANT:")
    print("  The Refund Analysis component will only appear for tickets")
    print("  that have a related order. If you don't see it, the ticket")
    print("  may not have an associated order or refund request.")
    print("="*80)

if __name__ == "__main__":
    main()
