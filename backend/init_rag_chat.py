"""
Initialize RAG Chat System
- Creates database tables for chat
- Indexes knowledge base into vector store
- Verifies all services are ready
"""
import sys
import os
from pathlib import Path

# Change to backend directory
backend_dir = Path(__file__).parent
os.chdir(backend_dir)
sys.path.insert(0, str(backend_dir))

from app.database import engine, SessionLocal
from app.models.base import Base
from app.models.chat import ChatConversation, ChatMessage, KnowledgeBase, FAQItem
from app.services.rag_service import get_rag_service
from app.services.embedding_service import get_embedding_service
from app.services.llm_service import llm_service
from app.services.knowledge_loader import knowledge_loader

print("=" * 80)
print("RAG CHAT SYSTEM INITIALIZATION")
print("=" * 80)

# Step 1: Create database tables
print("\n[1/4] Creating database tables...")
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")
except Exception as e:
    print(f"Error creating tables: {e}")
    sys.exit(1)

# Step 2: Check services
print("\n[2/4] Checking services...")
embedding_service = get_embedding_service()
rag_service = get_rag_service()

print(f"  Embedding Service: {'Available' if embedding_service.is_available() else 'Not available'}")
print(f"  LLM Service: {'Available' if llm_service.check_health() else 'Not available (Ollama not running)'}")
print(f"  Vector DB (FAISS): {'Ready' if rag_service.index is not None else 'Not initialized yet'}")

# Step 3: Load knowledge base
print("\n[3/4] Loading knowledge base...")
try:
    docs = knowledge_loader.load_all_documents()
    print(f"Loaded {len(docs)} documents from knowledge base")
    
    # Show categories
    categories = {}
    for doc in docs:
        cat = doc['category']
        categories[cat] = categories.get(cat, 0) + 1
    
    print("\n  Documents by category:")
    for cat, count in sorted(categories.items()):
        print(f"    - {cat}: {count} documents")
        
except Exception as e:
    print(f"Error loading knowledge base: {e}")
    sys.exit(1)

# Step 4: Index knowledge base
print("\n[4/4] Indexing knowledge base into vector store...")
print("  (This may take 30-60 seconds on first run)")

try:
    result = rag_service.index_knowledge_base(use_file_kb=True)
    
    if result['success']:
        print(f"Successfully indexed {result['indexed']} documents")
        print(f"  Message: {result['message']}")
    else:
        print(f"Indexing failed: {result.get('error', 'Unknown error')}")
        sys.exit(1)
        
except Exception as e:
    print(f"Error during indexing: {e}")
    sys.exit(1)

# Final status
print("\n" + "=" * 80)
print("INITIALIZATION COMPLETE")
print("=" * 80)

print("\n[SYSTEM STATUS]")
print(f"  RAG Service: {'Fully operational' if rag_service.is_available() else 'Partially operational'}")
print(f"  Knowledge Base: {len(docs)} documents indexed")
print(f"  Database: Tables created")

if not llm_service.check_health():
    print("\n[WARNING]")
    print("  LLM service (Ollama) is not running.")
    print("  The chatbot will use fallback responses.")
    print("  To enable full AI responses:")
    print("    1. Install Ollama from https://ollama.ai")
    print("    2. Run: ollama pull tinyllama")
    print("    3. Start Ollama service")
else:
    print("\nAll systems operational!")
    print("  The RAG chatbot is ready to use.")

print("\n" + "=" * 80)
