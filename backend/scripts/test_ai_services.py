"""
Test script for AI services
Run this to verify all AI services are working correctly
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.llm_service import LLMService
from app.services.embedding_service import EmbeddingService
from app.services.rag_service import RAGService
from app.services.vision_service import VisionService


def test_llm_service():
    """Test LLM service"""
    print("\n=== Testing LLM Service ===")
    llm = LLMService()
    
    if not llm.check_health():
        print("[ERROR] LLM service not available")
        print("   Make sure Ollama is running: ollama serve")
        print("   And model is pulled: ollama pull tinyllama")
        return False
    
    print("[OK] LLM service is available")
    print(f"   Model: {llm.model}")
    
    # Test generation
    prompt = "What is 2+2? Answer in one sentence."
    result = llm.generate(prompt, max_tokens=50)
    response = result.get('text', '')
    print(f"   Test prompt: {prompt}")
    print(f"   Response: {response[:100]}...")
    print(f"   Generation time: {result.get('generation_time_ms', 0):.0f}ms")
    
    return True


def test_embedding_service():
    """Test embedding service"""
    print("\n=== Testing Embedding Service ===")
    try:
        embedding = EmbeddingService()
        print("[OK] Embedding service initialized")
        print(f"   Model: {embedding.model_name}")
        
        # Test encoding
        texts = ["Hello world", "How are you?"]
        embeddings = embedding.encode(texts)
        
        if embeddings is not None and len(embeddings) > 0:
            print(f"   Generated {len(embeddings)} embeddings")
            print(f"   Embedding dimension: {len(embeddings[0])}")
            print("[OK] Embedding generation successful")
            return True
        else:
            print("[ERROR] Failed to generate embeddings")
            return False
    except Exception as e:
        print(f"[ERROR] Embedding service failed: {str(e)}")
        return False


def test_rag_service():
    """Test RAG service"""
    print("\n=== Testing RAG Service ===")
    try:
        rag = RAGService()
        print("[OK] RAG service initialized")
        
        # Test simple query
        print("   Testing knowledge base query...")
        result = rag.answer_question("What is the return policy?")
        
        if result and result.get('response'):
            print(f"   Response: {result['response'][:150]}...")
            print(f"   Sources: {len(result.get('sources', []))} documents")
            print("[OK] RAG query successful")
            return True
        else:
            print("[WARN] RAG returned empty response")
            return False
    except Exception as e:
        print(f"[ERROR] RAG service failed: {str(e)}")
        return False


def test_vision_service():
    """Test vision service"""
    print("\n=== Testing Vision Service ===")
    try:
        vision = VisionService()
        print("[OK] Vision service initialized")
        print(f"   Model: {vision.model_name}")
        
        # Note: Actual image testing requires an image file
        print("   [INFO] Image analysis requires actual image file")
        print("   Use the API endpoint to test with real images")
        
        return True
    except Exception as e:
        print(f"[ERROR] Vision service failed: {str(e)}")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("AI Services Test Suite")
    print("=" * 60)
    
    results = {
        "LLM": test_llm_service(),
        "Embedding": test_embedding_service(),
        "RAG": test_rag_service(),
        "Vision": test_vision_service()
    }
    
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    
    for service, passed in results.items():
        status = "[PASS]" if passed else "[FAIL]"
        print(f"{service:15} {status}")
    
    all_passed = all(results.values())
    
    print("\n" + "=" * 60)
    if all_passed:
        print("[SUCCESS] All services are working correctly!")
    else:
        print("[WARNING] Some services need attention. Check the output above.")
    print("=" * 60)
    
    return all_passed


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
