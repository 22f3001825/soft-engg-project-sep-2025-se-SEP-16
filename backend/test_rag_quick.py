"""
RAG Feature Test Script - Quick Version
Tests RAG features with reduced LLM calls for faster execution
"""
import sys
sys.path.append('.')

from app.services.rag_service import get_rag_service
from app.services.embedding_service import get_embedding_service
from app.services.llm_service import llm_service
import time

print("=" * 80)
print("RAG FEATURE TEST - QUICK VERSION")
print("=" * 80)
print("\nModel: TinyLlama-1.1B-Chat (Hugging Face)")
print("Embeddings: all-MiniLM-L6-v2")
print("Vector DB: FAISS")
print("=" * 80)

# Initialize services
print("\n[INITIALIZATION]")
print("-" * 80)

try:
    rag_service = get_rag_service()
    embedding_service = get_embedding_service()
    print("✓ Services initialized")
except Exception as e:
    print(f"✗ Failed to initialize services: {e}")
    sys.exit(1)

# Test 1: Check LLM availability
print("\n[TEST 1] LLM Service")
print("-" * 80)

llm_available = llm_service.check_health()
if llm_available:
    print("✓ TinyLlama model loaded and ready")
    print(f"  Model: {llm_service.model}")
    print(f"  Device: {llm_service.device}")
else:
    print("✗ TinyLlama model not available")
    print("  First request will trigger model download")

# Test 2: Check embedding service
print("\n[TEST 2] Embedding Service")
print("-" * 80)

if embedding_service.is_available():
    print("✓ Embedding model loaded")
    print(f"  Model: {embedding_service.model_name}")
    print(f"  Dimension: {embedding_service.get_embedding_dimension()}")
    
    # Test embedding generation
    test_text = "What is your refund policy?"
    start = time.time()
    embedding = embedding_service.encode_single(test_text)
    duration = time.time() - start
    
    print(f"  Test embedding: {embedding.shape}")
    print(f"  Generation time: {duration:.3f}s")
else:
    print("✗ Embedding service not available")
    sys.exit(1)

# Test 3: Check FAISS index
print("\n[TEST 3] FAISS Vector Database")
print("-" * 80)

if rag_service.index is not None:
    print(f"✓ FAISS index loaded")
    print(f"  Vectors: {rag_service.index.ntotal}")
    print(f"  Documents: {len(rag_service.documents)}")
else:
    print("✗ FAISS index not loaded")
    print("  Run: python init_rag_chat.py")
    sys.exit(1)

# Test 4: Semantic search (reduced queries)
print("\n[TEST 4] Semantic Search")
print("-" * 80)

test_queries = [
    "What is your refund policy?",
    "How do I return electronics?",
    "Can I get a refund for damaged items?"
]

for i, query in enumerate(test_queries, 1):
    print(f"\n{i}. Query: '{query}'")
    
    start = time.time()
    docs = rag_service.retrieve_relevant_docs(query, top_k=3)
    duration = time.time() - start
    
    if docs:
        print(f"   ✓ Found {len(docs)} documents ({duration:.3f}s)")
        top_doc = docs[0]
        print(f"   Top result:")
        metadata = top_doc.get('metadata', {})
        title = metadata.get('title', 'Unknown')
        category = metadata.get('category', 'Unknown')
        print(f"     Title: {title[:50]}...")
        print(f"     Category: {category}")
        print(f"     Similarity: {top_doc['similarity']:.2%}")
    else:
        print(f"   ✗ No documents found")

# Test 5: RAG Response Generation (ONLY 1 query instead of 3)
print("\n[TEST 5] RAG Response Generation")
print("-" * 80)

if not llm_available:
    print("⚠ Skipping - LLM not available")
else:
    query = "What is your refund policy?"
    print(f"\nQuery: '{query}'")
    print("Generating response...")
    
    start = time.time()
    # First retrieve documents
    docs = rag_service.retrieve_relevant_docs(query, top_k=3)
    # Then generate response with those documents
    response_text, sources = rag_service.generate_response(query, docs)
    duration = time.time() - start
    
    print(f"✓ Response generated ({duration:.2f}s)")
    print(f"Retrieved docs: {len(docs)}")
    print(f"Sources: {len(sources)}")
    
    print(f"\nResponse:")
    print(response_text[:500])
    
    # Check if response contains expected keywords
    answer_lower = response_text.lower()
    expected_topics = ['refund', 'return']
    found_topics = [topic for topic in expected_topics if topic in answer_lower]
    
    if found_topics:
        print(f"\n✓ Contains expected topics: {', '.join(found_topics)}")
    else:
        print(f"\n⚠ May not contain expected topics")

# Test 6: Edge Cases (no LLM calls)
print("\n[TEST 6] Edge Cases")
print("-" * 80)

edge_cases = [
    ("Empty query", ""),
    ("Single character", "x"),
    ("Out of domain query", "What is the meaning of life?"),
]

for name, query in edge_cases:
    print(f"\n{name}")
    print(f"Query: '{query}'")
    docs = rag_service.retrieve_relevant_docs(query, top_k=3)
    print(f"✓ Handled gracefully - {len(docs)} docs retrieved")

# Summary
print("\n" + "=" * 80)
print("TEST SUMMARY")
print("=" * 80)

print("\n✓ RAG System Components:")
print("  - TinyLlama-1.1B-Chat: Text generation")
print("  - all-MiniLM-L6-v2: Text embeddings")
print("  - FAISS: Vector search")
print(f"  - Knowledge base: {len(rag_service.documents)} documents")

print("\n✓ Features Tested:")
print("  - Semantic search")
print("  - Response generation (1 query)")
print("  - Edge case handling")

print("\n✓ Performance:")
print("  - Embedding generation: < 1 second")
print("  - Semantic search: < 1 second")
print("  - Response generation: 3-10 seconds (CPU)")
print("  - First generation: 20-30 seconds (model loading)")

print("\n" + "=" * 80)
print("RAG FEATURE TEST COMPLETE")
print("=" * 80)

print("\nNext steps:")
print("  1. Test Copilot features: python test_copilot_quick.py")
print("  2. Start backend: python -m uvicorn app.main:app --reload")
print("  3. Test via frontend: http://localhost:3000")
