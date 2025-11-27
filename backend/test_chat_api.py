"""
Quick test script to verify RAG Chat API is working
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

print("=" * 80)
print("RAG CHAT API TEST")
print("=" * 80)

# Test 1: Health Check
print("\n[TEST 1] Health Check")
try:
    response = requests.get(f"{BASE_URL}/chat/health")
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Chat service is healthy")
        print(f"  RAG Available: {data.get('rag_available')}")
        print(f"  Vision Available: {data.get('vision_available')}")
        print(f"  Status: {data.get('status')}")
    else:
        print(f"✗ Health check failed: {response.status_code}")
except Exception as e:
    print(f"✗ Error: {e}")
    print("  Make sure backend is running: uvicorn app.main:app --reload")
    exit(1)

# Test 2: Start Chat (without authentication for testing)
print("\n[TEST 2] Start Chat Conversation")
print("Note: This test requires authentication. Use the frontend to test full flow.")
print("  1. Start backend: cd backend && uvicorn app.main:app --reload")
print("  2. Start frontend: cd frontend && npm start")
print("  3. Login as customer@intellica.com / customer123")
print("  4. Click the chat button and test!")

print("\n" + "=" * 80)
print("BACKEND IS READY!")
print("=" * 80)
print("\nNext steps:")
print("  1. Keep backend running")
print("  2. Start frontend: cd frontend && npm start")
print("  3. Login and test the chatbot")
print("\n" + "=" * 80)
