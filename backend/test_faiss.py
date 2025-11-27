"""
Test FAISS Integration
"""
from app.services.rag_service import get_rag_service

print("=" * 60)
print("FAISS Integration Test")
print("=" * 60)

# Initialize RAG service
rag = get_rag_service()
print("\n✓ RAG Service initialized")

# Check if index exists
if rag.index is None:
    print("\n⚠ No index found, creating new index...")
    result = rag.index_knowledge_base()
    print(f"✓ Indexed {result['indexed']} documents")
    print(f"✓ Dimension: {result['dimension']}")
else:
    print(f"\n✓ Index loaded with {rag.index.ntotal} vectors")

# Test search
print("\n" + "=" * 60)
print("Testing Search Functionality")
print("=" * 60)

queries = [
    "What is the refund policy?",
    "How do I return electronics?",
    "Can I get a refund for damaged items?"
]

for query in queries:
    print(f"\nQuery: {query}")
    docs = rag.retrieve_relevant_docs(query, top_k=3)
    print(f"Found {len(docs)} relevant documents:")
    
    for i, doc in enumerate(docs, 1):
        title = doc['metadata']['title']
        similarity = doc['similarity']
        category = doc['metadata']['category']
        print(f"  {i}. {title[:50]}...")
        print(f"     Category: {category}")
        print(f"     Similarity: {similarity:.3f}")

# Test RAG answer
print("\n" + "=" * 60)
print("Testing RAG Answer Generation")
print("=" * 60)

test_query = "Can I return electronics after 30 days?"
print(f"\nQuery: {test_query}")

result = rag.answer_question(test_query, top_k=3)
print(f"\nAnswer: {result['response']}")
print(f"Sources: {result['sources']}")
print(f"Retrieved docs: {result['retrieved_docs']}")

print("\n" + "=" * 60)
print("✓ All tests passed!")
print("=" * 60)
