"""
Test script for AI services
Run this to verify all AI services are working correctly
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.llm_service import get_llm_service
from app.services.embedding_service import get_embedding_service
from app.services.rag_service import get_rag_service
from app.services.vision_service import get_vision_service


def test_llm_service():
    """Test LLM service"""
    print("\n=== Testing LLM Service ===")
    llm = get_llm_service()
    
    if not llm.is_available():
        print("[ERROR] LLM service not available")
        print("   Make sure Ollama is running and llama3.1:8b is pulled")
        return False
    
    print("[OK] LLM service is available")
    
    # Test generation
    prompt = "What is 2+2? Answer in one sentence."
    response = llm.generate(prompt, max_tokens=50)
    print(f"   Test prompt: {prompt}")
    print(f"   Response: {response[:100]}...")
    
    return True


def test_embedding_service():
    """Test embedding service"""
    print("\n=== Testing Embedding Service ===")
    embedding = get_embedding_service()
    
    if not embedding.is_available():
        print("[ERROR] Embedding service not available")
        return False
    
    print("[OK] Embedding service is available")
    print(f"   Model: {embedding.model_name}")
    print(f"   Dimension: {embedding.get_embedding_dimension()}")
    
    # Test encoding
    texts = ["Hello world", "How are you?"]
    embeddings = embedding.encode(texts)
    
    if embeddings is not None:
        print(f"   Generated embeddings shape: {embeddings.shape}")
        print("[OK] Embedding generation successful")
        return True
    else:
        print("[ERROR] Failed to generate embeddings")
        return False


def test_rag_service():
    """Test RAG service"""
    print("\n=== Testing RAG Service ===")
    rag = get_rag_service()
    
    if not rag.is_available():
        print("[ERROR] RAG service not available")
        print("   Make sure LLM and Embedding services are working")
        return False
    
    print("[OK] RAG service is available")
    
    # Test indexing (will fail if no KB articles)
    print("   Testing knowledge base indexing...")
    result = rag.index_knowledge_base()
    
    if result['success']:
        print(f"   [OK] Indexed {result.get('indexed', 0)} articles")
    else:
        print(f"   [WARN] Indexing result: {result.get('message', 'No articles')}")
    
    # Test retrieval
    print("   Testing document retrieval...")
    docs = rag.retrieve_relevant_docs("refund policy", top_k=3)
    print(f"   Retrieved {len(docs)} documents")
    
    if docs:
        print(f"   Top result: {docs[0]['content'][:100]}...")
    
    # Test question answering
    print("   Testing question answering...")
    answer = rag.answer_question("What is your refund policy?")
    print(f"   Response: {answer['response'][:150]}...")
    print(f"   Sources: {answer['sources']}")
    
    return True


def test_vision_service():
    """Test vision service"""
    print("\n=== Testing Vision Service ===")
    vision = get_vision_service()
    
    if not vision.is_available():
        print("[ERROR] Vision service not available")
        return False
    
    print("[OK] Vision service is available")
    print(f"   Model: {vision.model_name}")
    
    # Note: Actual image testing requires an image file
    print("   [INFO] Image analysis requires actual image file")
    print("   Use the API endpoint to test with real images")
    
    return True


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
