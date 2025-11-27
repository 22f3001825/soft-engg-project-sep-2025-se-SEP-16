"""
Test script for Knowledge Base Search API
Tests Task 2.3 implementation
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

def test_get_categories(token):
    """Test 1: Get knowledge base categories"""
    print("\n" + "="*80)
    print("TEST 1: Get Knowledge Base Categories")
    print("="*80)
    
    try:
        response = requests.get(
            f"{BASE_URL}/copilot/knowledge-base/categories",
            headers=get_headers(token)
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✓ Categories retrieved successfully")
            print(f"  Total Documents: {data.get('total_documents')}")
            print(f"  Categories:")
            for cat in data.get('categories', []):
                print(f"    - {cat['name']}: {cat['count']} documents")
            return True
        else:
            print(f"✗ Failed to get categories: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_search_all_categories(token):
    """Test 2: Search without category filter"""
    print("\n" + "="*80)
    print("TEST 2: Search Knowledge Base (All Categories)")
    print("="*80)
    
    test_queries = [
        "refund policy",
        "return process",
        "shipping",
        "payment",
        "account"
    ]
    
    for query in test_queries:
        print(f"\n  Query: '{query}'")
        try:
            response = requests.get(
                f"{BASE_URL}/copilot/knowledge-base/search",
                params={"query": query},
                headers=get_headers(token)
            )
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                print(f"  ✓ Found {len(results)} results")
                
                for i, result in enumerate(results[:3], 1):
                    print(f"    {i}. {result['title']}")
                    print(f"       Category: {result['category']}")
                    print(f"       Relevance: {result.get('relevance_score', 'N/A')}")
                    print(f"       Excerpt: {result['excerpt'][:80]}...")
            else:
                print(f"  ✗ Search failed: {response.status_code}")
        except Exception as e:
            print(f"  ✗ Error: {e}")

def test_search_with_category(token):
    """Test 3: Search with category filter"""
    print("\n" + "="*80)
    print("TEST 3: Search with Category Filter")
    print("="*80)
    
    test_cases = [
        ("refund", "Refund"),
        ("shipping", "Shipping"),
        ("return", "Return"),
    ]
    
    for query, category in test_cases:
        print(f"\n  Query: '{query}' | Category: '{category}'")
        try:
            response = requests.get(
                f"{BASE_URL}/copilot/knowledge-base/search",
                params={"query": query, "category": category},
                headers=get_headers(token)
            )
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                print(f"  ✓ Found {len(results)} results in {category}")
                
                for i, result in enumerate(results[:2], 1):
                    print(f"    {i}. {result['title']} ({result['category']})")
            else:
                print(f"  ✗ Search failed: {response.status_code}")
        except Exception as e:
            print(f"  ✗ Error: {e}")

def test_search_edge_cases(token):
    """Test 4: Edge cases"""
    print("\n" + "="*80)
    print("TEST 4: Edge Cases")
    print("="*80)
    
    edge_cases = [
        ("", "Empty query"),
        ("x", "Single character"),
        ("nonexistentquery12345", "No results expected"),
        ("a" * 200, "Very long query"),
    ]
    
    for query, description in edge_cases:
        print(f"\n  Test: {description}")
        print(f"  Query: '{query[:50]}{'...' if len(query) > 50 else ''}'")
        try:
            response = requests.get(
                f"{BASE_URL}/copilot/knowledge-base/search",
                params={"query": query},
                headers=get_headers(token)
            )
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                print(f"  ✓ Response received: {len(results)} results")
            elif response.status_code == 400:
                print(f"  ✓ Validation error (expected): {response.status_code}")
            else:
                print(f"  ⚠ Unexpected status: {response.status_code}")
        except Exception as e:
            print(f"  ✗ Error: {e}")

def test_response_structure(token):
    """Test 5: Verify response structure"""
    print("\n" + "="*80)
    print("TEST 5: Response Structure Validation")
    print("="*80)
    
    try:
        response = requests.get(
            f"{BASE_URL}/copilot/knowledge-base/search",
            params={"query": "refund"},
            headers=get_headers(token)
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Check top-level structure
            required_fields = ['query', 'results']
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                print(f"  ✗ Missing fields: {missing_fields}")
                return False
            
            print("  ✓ Top-level structure valid")
            
            # Check result structure
            if data['results']:
                result = data['results'][0]
                result_fields = ['title', 'category', 'excerpt', 'tags']
                missing_result_fields = [f for f in result_fields if f not in result]
                
                if missing_result_fields:
                    print(f"  ⚠ Result missing optional fields: {missing_result_fields}")
                else:
                    print("  ✓ Result structure valid")
                
                print(f"\n  Sample Result:")
                print(f"    Title: {result.get('title')}")
                print(f"    Category: {result.get('category')}")
                print(f"    Subcategory: {result.get('subcategory', 'N/A')}")
                print(f"    Relevance: {result.get('relevance_score', 'N/A')}")
                print(f"    Tags: {', '.join(result.get('tags', []))}")
                print(f"    Excerpt: {result.get('excerpt', '')[:100]}...")
            
            return True
        else:
            print(f"  ✗ Request failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def test_performance(token):
    """Test 6: Performance metrics"""
    print("\n" + "="*80)
    print("TEST 6: Performance Testing")
    print("="*80)
    
    import time
    
    queries = ["refund", "shipping", "return", "payment", "account"]
    times = []
    
    for query in queries:
        start = time.time()
        try:
            response = requests.get(
                f"{BASE_URL}/copilot/knowledge-base/search",
                params={"query": query},
                headers=get_headers(token)
            )
            elapsed = (time.time() - start) * 1000  # Convert to ms
            times.append(elapsed)
            
            if response.status_code == 200:
                print(f"  Query '{query}': {elapsed:.0f}ms")
            else:
                print(f"  Query '{query}': Failed ({response.status_code})")
        except Exception as e:
            print(f"  Query '{query}': Error - {e}")
    
    if times:
        avg_time = sum(times) / len(times)
        max_time = max(times)
        min_time = min(times)
        
        print(f"\n  Performance Summary:")
        print(f"    Average: {avg_time:.0f}ms")
        print(f"    Min: {min_time:.0f}ms")
        print(f"    Max: {max_time:.0f}ms")
        
        if avg_time < 500:
            print(f"    ✓ Performance: Excellent")
        elif avg_time < 1000:
            print(f"    ✓ Performance: Good")
        else:
            print(f"    ⚠ Performance: Needs optimization")

def main():
    print("="*80)
    print("KNOWLEDGE BASE SEARCH API TEST")
    print("Task 2.3 Implementation Verification")
    print("="*80)
    
    # Step 1: Login
    print("\nLogging in as agent...")
    token = login_as_agent()
    
    if not token:
        print("\n✗ Failed to login. Make sure backend is running.")
        print("  Start backend: cd backend && python -m uvicorn app.main:app --reload")
        return
    
    print("✓ Login successful")
    
    # Run tests
    test_get_categories(token)
    test_search_all_categories(token)
    test_search_with_category(token)
    test_search_edge_cases(token)
    test_response_structure(token)
    test_performance(token)
    
    print("\n" + "="*80)
    print("TESTING COMPLETE")
    print("="*80)
    print("\nNext steps:")
    print("  1. Start frontend: cd frontend && npm start")
    print("  2. Login as agent@intellica.com / agent123")
    print("  3. Open any ticket details page")
    print("  4. Expand 'Knowledge Base' panel in sidebar")
    print("  5. Test search functionality:")
    print("     - Type search queries")
    print("     - Filter by category")
    print("     - Click on results to view full document")
    print("     - Test collapsible functionality")
    print("\n" + "="*80)

if __name__ == "__main__":
    main()
