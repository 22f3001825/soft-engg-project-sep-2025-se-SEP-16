"""
Test Intent & Sentiment Analysis - Fallback Method
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.services.rag_service import get_rag_service

print("=" * 70)
print("Testing Intent & Sentiment Analysis (Fallback)")
print("=" * 70)

rag_service = get_rag_service()

# Test the fallback method directly
test_messages = [
    "I want to return my headphones",
    "Where is my refund?",
    "Thank you so much!",
    "What's the status of my order?",
    "Hello, I need help",
    "This is terrible!",
    "What is your return policy?",
]

print("\n✓ Testing fallback intent/sentiment detection\n")

for i, message in enumerate(test_messages, 1):
    print(f"{i}. Message: \"{message}\"")
    result = rag_service._fallback_intent_sentiment(message)
    print(f"   Intent: {result['intent']} (confidence: {result['intent_confidence']:.2f})")
    print(f"   Sentiment: {result['sentiment']} (score: {result['sentiment_score']:.2f})")
    print()

print("✅ Fallback method works!")
