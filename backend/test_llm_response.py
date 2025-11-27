"""
Test LLM response quality
"""
import sys
sys.path.append('.')

from app.services.llm_service import llm_service

def test_llm_responses():
    """Test LLM with various prompts"""
    
    print("=" * 80)
    print("Testing LLM Response Quality")
    print("=" * 80)
    
    # Test 1: Simple question
    print("\n\nTest 1: Simple refund policy question")
    print("-" * 80)
    
    system_prompt = """You are a helpful customer support assistant. Answer questions clearly and accurately."""
    
    prompt = """Answer this customer question:

Question: Can you tell me about the refund policy?

Provide a clear, helpful answer about refund policies."""
    
    result = llm_service.generate(
        prompt=prompt,
        system_prompt=system_prompt,
        temperature=0.7,
        max_tokens=200
    )
    
    print(f"Model: {result.get('model')}")
    print(f"Generation time: {result.get('generation_time_ms')}ms")
    print(f"Success: {result.get('success')}")
    print(f"\nResponse:\n{result.get('text')}")
    
    # Test 2: With context
    print("\n\n" + "=" * 80)
    print("Test 2: Question with knowledge base context")
    print("-" * 80)
    
    context = """
Knowledge Base Information:
Our refund policy allows returns within 30 days of purchase for most items. 
Electronics have a 14-day return window. Items must be in original condition with packaging.
Full refunds are provided for defective items. Partial refunds may apply for opened items.
"""
    
    prompt2 = f"""{context}

Customer Question: Can you tell me about refund policy?

Instructions:
- Use the knowledge base information above
- Provide a clear, helpful answer
- Keep it concise (2-3 sentences)

Answer:"""
    
    result2 = llm_service.generate(
        prompt=prompt2,
        system_prompt=system_prompt,
        temperature=0.7,
        max_tokens=200
    )
    
    print(f"Model: {result2.get('model')}")
    print(f"Generation time: {result2.get('generation_time_ms')}ms")
    print(f"Success: {result2.get('success')}")
    print(f"\nResponse:\n{result2.get('text')}")
    
    # Test 3: Very simple prompt
    print("\n\n" + "=" * 80)
    print("Test 3: Very simple prompt")
    print("-" * 80)
    
    simple_prompt = "Explain the refund policy in 2 sentences."
    
    result3 = llm_service.generate(
        prompt=simple_prompt,
        system_prompt="You are a helpful assistant.",
        temperature=0.5,
        max_tokens=100
    )
    
    print(f"Model: {result3.get('model')}")
    print(f"Generation time: {result3.get('generation_time_ms')}ms")
    print(f"Success: {result3.get('success')}")
    print(f"\nResponse:\n{result3.get('text')}")
    
    print("\n\n" + "=" * 80)
    print("Analysis:")
    print("=" * 80)
    print("\nModel Comparison:")
    print("- Flan-T5-small (80M params): Fast but poor quality ❌")
    print("- Flan-T5-base (250M params): Good balance")
    print("- TinyLlama (1.1B params): Better quality, chat-optimized ✅")
    print("\nNow using TinyLlama-1.1B-Chat...")

if __name__ == "__main__":
    test_llm_responses()
