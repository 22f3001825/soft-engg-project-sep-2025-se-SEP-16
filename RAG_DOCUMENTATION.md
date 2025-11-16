# RAG (Retrieval-Augmented Generation) API Documentation

## Overview

The RAG system provides AI-powered customer support capabilities using semantic search and large language models. It combines a knowledge base of support documents with intelligent retrieval and response generation.

**Version**: 1.0  
**Base Path**: `/api/chat` (planned)  
**Current Status**: Backend services implemented, API endpoints in development

---

## Architecture

### Core Components

1. **Embedding Service** (`embedding_service.py`)
   - Converts text to vector embeddings
   - Model: `sentence-transformers/all-MiniLM-L6-v2`
   - Dimension: 384
   - Performance: ~25-150ms per embedding

2. **Vector Database** (ChromaDB)
   - Stores document embeddings
   - Enables semantic similarity search
   - In-memory storage (production: persistent storage recommended)

3. **Knowledge Loader** (`knowledge_loader.py`)
   - Loads documents from file system
   - Supports: Markdown (.md), CSV (.csv)
   - Categories: Agent docs, Customer docs, Supervisor docs

4. **LLM Service** (`llm_service.py`)
   - Generates natural language responses
   - Backend: Ollama (local LLM)
   - Model: TinyLlama (configurable)

5. **RAG Service** (`rag_service.py`)
   - Orchestrates retrieval and generation
   - Combines semantic search with LLM responses
   - Context-aware conversation handling

6. **Refund Eligibility Service** (`refund_eligibility_service.py`)
   - Automated refund decision making
   - Policy-based eligibility checks
   - LLM-powered reasoning

---

## Service APIs

### Embedding Service

#### `get_embedding_service() -> EmbeddingService`
Get singleton embedding service instance.

**Methods:**

##### `encode(texts: List[str], batch_size: int = 32) -> np.ndarray`
Generate embeddings for multiple texts.

**Parameters:**
- `texts`: List of text strings to embed
- `batch_size`: Batch size for processing (default: 32)

**Returns:** NumPy array of shape `(n_texts, 384)`

**Example:**
```python
from app.services.embedding_service import get_embedding_service

embedding_service = get_embedding_service()
texts = ["How do I return a product?", "What is the refund policy?"]
embeddings = embedding_service.encode(texts)
# Returns: array of shape (2, 384)
```

##### `encode_single(text: str) -> np.ndarray`
Generate embedding for a single text.

**Parameters:**
- `text`: Text string to embed

**Returns:** NumPy array of shape `(384,)`

**Example:**
```python
embedding = embedding_service.encode_single("How do I return a product?")
# Returns: array of shape (384,)
```

##### `get_embedding_dimension() -> int`
Get embedding dimension.

**Returns:** `384`

##### `is_available() -> bool`
Check if embedding service is operational.

**Returns:** `True` if model loaded successfully

---

### Knowledge Loader

#### `knowledge_loader.load_all_documents() -> List[Dict]`
Load all documents from knowledge base.

**Returns:** List of document dictionaries

**Document Structure:**
```python
{
    "title": str,           # Document title
    "content": str,         # Full document content
    "category": str,        # Document category
    "subcategory": str,     # Document type (agent/customer/supervisor)
    "file_name": str,       # Source file name
    "file_path": str,       # Full file path
    "tags": List[str],      # Document tags
    "keywords": List[str]   # Extracted keywords
}
```

**Example:**
```python
from app.services.knowledge_loader import knowledge_loader

docs = knowledge_loader.load_all_documents()
print(f"Loaded {len(docs)} documents")
# Output: Loaded 47 documents
```

#### `get_documents_by_category(category: str) -> List[Dict]`
Filter documents by category.

**Parameters:**
- `category`: Category name (e.g., "Policy", "FAQ - General")

**Returns:** Filtered document list

#### `search_documents(query: str) -> List[Dict]`
Simple keyword search in documents.

**Parameters:**
- `query`: Search query

**Returns:** Documents with relevance scores

---

### RAG Service

#### `get_rag_service() -> RAGService`
Get singleton RAG service instance.

**Methods:**

##### `index_knowledge_base(use_file_kb: bool = True) -> Dict`
Index knowledge base documents into vector database.

**Parameters:**
- `use_file_kb`: Use file-based knowledge loader (default: True)

**Returns:**
```python
{
    "success": bool,
    "indexed": int,          # Number of documents indexed
    "message": str,
    "categories": List[str]  # Document categories
}
```

**Performance:** ~1.8 seconds for 47 documents

**Example:**
```python
from app.services.rag_service import get_rag_service

rag_service = get_rag_service()
result = rag_service.index_knowledge_base()
print(f"Indexed {result['indexed']} documents")
```

##### `retrieve_relevant_docs(query: str, top_k: int = 5, category_filter: Optional[str] = None) -> List[Dict]`
Retrieve relevant documents using semantic search.

**Parameters:**
- `query`: User query
- `top_k`: Number of documents to retrieve (default: 5)
- `category_filter`: Optional category filter

**Returns:**
```python
[
    {
        "content": str,      # Document content
        "metadata": {        # Document metadata
            "doc_id": str,
            "title": str,
            "category": str,
            "subcategory": str,
            "file_name": str
        },
        "distance": float    # Similarity distance (lower = more similar)
    }
]
```

**Performance:** 10-36ms per query

**Example:**
```python
docs = rag_service.retrieve_relevant_docs(
    query="What is the refund policy for electronics?",
    top_k=3
)
for doc in docs:
    relevance = 1 - doc['distance']
    print(f"Title: {doc['metadata']['title']}")
    print(f"Relevance: {relevance:.2%}")
```

##### `answer_question(query: str, conversation_history: Optional[List[Dict]] = None, category_filter: Optional[str] = None, top_k: int = 5) -> Dict`
Complete RAG pipeline: retrieve documents and generate answer.

**Parameters:**
- `query`: User question
- `conversation_history`: Previous conversation messages
- `category_filter`: Optional category filter
- `top_k`: Number of documents to retrieve

**Returns:**
```python
{
    "response": str,         # Generated answer
    "sources": List[str],    # Source document IDs
    "retrieved_docs": int,   # Number of documents retrieved
    "timestamp": str         # ISO timestamp
}
```

**Performance:** 20-35 seconds per response (depends on LLM)

**Example:**
```python
result = rag_service.answer_question(
    query="I want to return my headphones. What's the process?",
    top_k=3
)
print(result['response'])
```

**With Conversation History:**
```python
history = [
    {"role": "CUSTOMER", "content": "I bought headphones last week"},
    {"role": "AI", "content": "I can help you with your headphones."}
]

result = rag_service.answer_question(
    query="They stopped working. Can I return them?",
    conversation_history=history,
    top_k=3
)
```

##### `is_available() -> bool`
Check if RAG service is fully operational.

**Returns:** `True` if all components (vector DB, embeddings, LLM) are available

---

### LLM Service

#### `llm_service.generate(prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.7, max_tokens: int = 500) -> Dict`
Generate text using LLM.

**Parameters:**
- `prompt`: User prompt
- `system_prompt`: System instructions (optional)
- `temperature`: Sampling temperature (0.0-1.0)
- `max_tokens`: Maximum response length

**Returns:**
```python
{
    "text": str,           # Generated text
    "model": str,          # Model name
    "tokens": int          # Token count (if available)
}
```

**Example:**
```python
from app.services.llm_service import llm_service

result = llm_service.generate(
    prompt="Explain the return policy in simple terms",
    system_prompt="You are a helpful customer support assistant.",
    temperature=0.7
)
print(result['text'])
```

#### `llm_service.check_health() -> bool`
Check if LLM service is available.

**Returns:** `True` if Ollama is running and accessible

---

### Refund Eligibility Service

#### `get_eligibility_service() -> RefundEligibilityService`
Get singleton eligibility service instance.

**Methods:**

##### `check_eligibility(product_category: str, purchase_date: datetime, reason: str, condition: str, has_packaging: bool, has_receipt: bool) -> Dict`
Check refund eligibility for a product.

**Parameters:**
- `product_category`: Product category (e.g., "Electronics", "Apparel")
- `purchase_date`: Date of purchase
- `reason`: Return reason
- `condition`: Product condition ("unused", "opened", "damaged")
- `has_packaging`: Has original packaging
- `has_receipt`: Has purchase receipt

**Returns:**
```python
{
    "eligibility_status": str,  # "ELIGIBLE", "NOT_ELIGIBLE", "PARTIAL"
    "confidence": str,          # "HIGH", "MEDIUM", "LOW"
    "refund_amount": str,       # "FULL", "PARTIAL", "NONE"
    "reasoning": str,           # Explanation
    "policy_references": List[str]
}
```

**Example:**
```python
from app.services.refund_eligibility_service import get_eligibility_service
from datetime import datetime, timedelta

eligibility_service = get_eligibility_service()

result = eligibility_service.check_eligibility(
    product_category="Electronics",
    purchase_date=datetime.now() - timedelta(days=10),
    reason="Product defective",
    condition="opened",
    has_packaging=True,
    has_receipt=True
)

print(f"Status: {result['eligibility_status']}")
print(f"Reasoning: {result['reasoning']}")
```

---

## Knowledge Base Structure

### Directory Layout
```
knowledge_base/
├── agent_docs/           # Internal agent documentation
│   ├── escalation_rules.md
│   ├── policy_*.md
│   ├── sop_*.md
│   └── templates_*.md
├── customer_docs/        # Customer-facing documentation
│   ├── faq_returns_refunds.csv
│   ├── faq_returns_refunds.md
│   ├── guide_*.md
│   └── policy_*.md
└── supervisor_docs/      # Supervisor documentation
    ├── agent_evaluation_criteria.md
    ├── fraud_review_case_log.md
    └── refund_approval_guidelines.md
```

### Document Categories

**Agent Documents (12 docs):**
- Escalation Rules
- Policy Documents
- Standard Operating Procedures (SOPs)
- Response Templates
- Communication Guidelines

**Customer Documents (28 docs):**
- FAQ entries (CSV format)
- Return/Refund guides
- Policy documents
- General information

**Supervisor Documents (7 docs):**
- Agent evaluation criteria
- Fraud detection guidelines
- Refund approval processes
- Team management docs

---

## Performance Metrics

### Indexing Performance
- **Documents**: 47 total
- **Indexing Time**: ~1.8 seconds
- **Time per Document**: 0.04 seconds
- **Embedding Dimension**: 384
- **Model**: all-MiniLM-L6-v2

### Query Performance
- **Semantic Search**: 10-36ms per query
- **Embedding Generation**: 25-150ms
- **LLM Response**: 20-35 seconds
- **Total RAG Pipeline**: 20-35 seconds

### Accuracy Metrics
- **Semantic Relevance**: 17-30% similarity scores
- **Document Retrieval**: Top-3 accuracy
- **Context Window**: Last 5 conversation messages

---

## Configuration

### Environment Variables

```bash
# LLM Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=tinyllama

# Embedding Configuration
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_BATCH_SIZE=32

# Vector Database
CHROMA_PERSIST_DIRECTORY=./chroma_db  # Optional: for persistence
```

### Model Selection

**Embedding Models:**
- **Current**: `all-MiniLM-L6-v2` (384 dims, fast, good quality)
- **Alternative**: `BAAI/bge-m3` (1024 dims, slow, best quality)

**LLM Models (Ollama):**
- **TinyLlama**: Fast, lightweight (1.1B params)
- **Llama 2**: Better quality (7B/13B params)
- **Mistral**: High quality (7B params)

---

## Error Handling

### Common Errors

#### Embedding Service Unavailable
```python
if not embedding_service.is_available():
    # Handle: Model failed to load
    # Solution: Check model installation, memory
```

#### LLM Service Unavailable
```python
if not llm_service.check_health():
    # Handle: Ollama not running
    # Solution: Start Ollama service
```

#### Empty Knowledge Base
```python
result = rag_service.index_knowledge_base()
if result['indexed'] == 0:
    # Handle: No documents found
    # Solution: Check knowledge_base directory
```

#### Vector Database Error
```python
try:
    docs = rag_service.retrieve_relevant_docs(query)
except Exception as e:
    # Handle: ChromaDB error
    # Solution: Reinitialize vector database
```

---

## Testing

### Running Tests

```bash
# Activate virtual environment
cd backend
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# or
source venv/bin/activate      # Linux/Mac

# Run comprehensive test suite
python test_rag_simple.py
```

### Test Coverage

The test suite (`test_rag_simple.py`) validates:

1. ✅ Database connectivity
2. ✅ Knowledge base loading (47 documents)
3. ✅ Embedding service (384-dim vectors)
4. ✅ Vector database indexing
5. ✅ Semantic search retrieval
6. ✅ LLM response generation
7. ✅ Context-aware conversations
8. ✅ Refund eligibility verification
9. ✅ Customer support automation
10. ✅ Database + RAG integration

**Expected Results:**
- All 10 tests: PASS
- Indexing time: < 3 seconds
- Search latency: < 50ms
- System status: OPERATIONAL

---

## Integration Guide

### Basic Integration

```python
from app.services.rag_service import get_rag_service

# Initialize
rag_service = get_rag_service()

# Index knowledge base (one-time setup)
result = rag_service.index_knowledge_base()
print(f"Indexed {result['indexed']} documents")

# Answer customer questions
response = rag_service.answer_question(
    query="How do I return a product?",
    top_k=3
)
print(response['response'])
```

### With Conversation Context

```python
# Maintain conversation history
conversation = []

# First message
result = rag_service.answer_question("I bought headphones last week")
conversation.append({"role": "CUSTOMER", "content": "I bought headphones last week"})
conversation.append({"role": "AI", "content": result['response']})

# Follow-up message (context-aware)
result = rag_service.answer_question(
    query="They stopped working. Can I return them?",
    conversation_history=conversation
)
```

### Category Filtering

```python
# Search only in customer FAQs
docs = rag_service.retrieve_relevant_docs(
    query="return policy",
    category_filter="Customer FAQ",
    top_k=5
)
```

---

## Best Practices

### 1. Indexing
- Index knowledge base on application startup
- Re-index when documents are updated
- Use persistent storage for production

### 2. Query Optimization
- Keep queries concise and specific
- Use category filters when possible
- Retrieve 3-5 documents for best balance

### 3. Conversation Management
- Limit history to last 5 messages
- Clear history for new topics
- Include relevant context (order ID, customer info)

### 4. Error Handling
- Always check service availability
- Provide fallback responses
- Log errors for monitoring

### 5. Performance
- Cache frequently asked questions
- Use async operations for API endpoints
- Monitor LLM response times

---

## Future Enhancements

### Planned Features
- [ ] REST API endpoints (`/api/chat`)
- [ ] Streaming responses (SSE)
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] A/B testing framework
- [ ] Response quality metrics
- [ ] User feedback loop
- [ ] Persistent vector database
- [ ] GPU acceleration support
- [ ] Fine-tuned domain models

### API Endpoints (Planned)

#### `POST /api/chat/query`
Ask a question to the RAG system.

**Request:**
```json
{
  "query": "How do I return a product?",
  "conversation_id": "optional-uuid",
  "category_filter": "optional-category",
  "top_k": 3
}
```

**Response:**
```json
{
  "response": "To return a product...",
  "sources": ["doc_1", "doc_2"],
  "conversation_id": "uuid",
  "timestamp": "2025-11-16T10:30:00Z"
}
```

#### `POST /api/chat/index`
Trigger knowledge base re-indexing (admin only).

#### `GET /api/chat/health`
Check RAG system health status.

---

## Support

### Prerequisites
- Python 3.9+
- Ollama installed and running
- 4GB+ RAM available
- Knowledge base documents in place

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Download embedding model (automatic on first use)
# Model: sentence-transformers/all-MiniLM-L6-v2 (~80MB)

# Install and start Ollama
# Visit: https://ollama.ai
ollama pull tinyllama
```

### Troubleshooting

**Issue**: Slow indexing (>30 seconds)
- **Solution**: Check if using correct embedding model (all-MiniLM-L6-v2)

**Issue**: LLM not responding
- **Solution**: Verify Ollama is running: `ollama list`

**Issue**: Empty search results
- **Solution**: Ensure knowledge base is indexed: `index_knowledge_base()`

**Issue**: Out of memory
- **Solution**: Reduce batch size or use smaller model

---

## License

Internal use only - Intellica E-commerce Platform

## Version History

- **v1.0** (2025-11-16): Initial implementation
  - Embedding service with all-MiniLM-L6-v2
  - ChromaDB vector database
  - RAG pipeline with Ollama
  - Comprehensive test suite
  - 47 knowledge base documents
