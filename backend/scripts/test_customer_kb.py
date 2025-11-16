"""
Test Customer Knowledge Base Loading
Verify that customer documents are loaded correctly for RAG chatbot
"""

import sys
from pathlib import Path

backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

import os
os.chdir(backend_path)

print("=" * 80)
print("CUSTOMER KNOWLEDGE BASE TEST")
print("=" * 80)

from app.services.knowledge_loader import knowledge_loader

# Reload documents to include customer docs
print("\nLoading knowledge base documents...")
documents = knowledge_loader.load_all_documents()

print(f"Total documents loaded: {len(documents)}")

# Categorize documents
categories = {}
for doc in documents:
    cat = doc['category']
    subcat = doc['subcategory']
    key = f"{cat} ({subcat})"
    categories[key] = categories.get(key, 0) + 1

print("\nDocuments by Category:")
for cat, count in sorted(categories.items()):
    print(f"  {cat}: {count} documents")

# Show customer documents specifically
print("\n" + "=" * 80)
print("CUSTOMER-FACING DOCUMENTS")
print("=" * 80)

customer_docs = [doc for doc in documents if doc['subcategory'] == 'customer']

print(f"\nTotal customer documents: {len(customer_docs)}")

for i, doc in enumerate(customer_docs[:10], 1):
    print(f"\n{i}. {doc['title']}")
    print(f"   Category: {doc['category']}")
    print(f"   File: {doc['file_name']}")
    print(f"   Keywords: {', '.join(doc['keywords'][:5])}")
    content_preview = doc['content'][:150].replace('\n', ' ')
    print(f"   Preview: {content_preview}...")

# Test search with customer queries
print("\n" + "=" * 80)
print("CUSTOMER QUERY SEARCH TESTS")
print("=" * 80)

test_queries = [
    "How do I return an item?",
    "refund status",
    "damaged product",
    "return shipping cost",
    "exchange size",
    "gift return",
    "late return"
]

for query in test_queries:
    print(f"\nQuery: '{query}'")
    results = knowledge_loader.search_documents(query)
    
    # Filter for customer-facing results
    customer_results = [r for r in results if r['subcategory'] == 'customer']
    
    print(f"  Total results: {len(results)}")
    print(f"  Customer-facing results: {len(customer_results)}")
    
    if customer_results:
        top = customer_results[0]
        print(f"  Top result: {top['title']}")
        print(f"  Category: {top['category']}")
        print(f"  Relevance: {top.get('relevance_score', 0)}")

# Test FAQ CSV loading
print("\n" + "=" * 80)
print("FAQ CSV LOADING TEST")
print("=" * 80)

faq_docs = [doc for doc in documents if 'FAQ' in doc['category']]
print(f"\nFAQ entries loaded: {len(faq_docs)}")

if faq_docs:
    print("\nSample FAQ entries:")
    for i, doc in enumerate(faq_docs[:5], 1):
        print(f"\n{i}. {doc['title']}")
        print(f"   Answer preview: {doc['content'][:100]}...")

print("\n" + "=" * 80)
print("TEST COMPLETE")
print("=" * 80)
print(f"\nSummary:")
print(f"  Total documents: {len(documents)}")
print(f"  Customer documents: {len(customer_docs)}")
print(f"  FAQ entries: {len(faq_docs)}")
print(f"  Ready for RAG chatbot: {'YES' if customer_docs else 'NO'}")
print("=" * 80)
