"""
RAG (Retrieval-Augmented Generation) Service
Handles knowledge base retrieval and response generation using FAISS
"""
from typing import List, Dict, Optional, Tuple
import faiss
import numpy as np
import pickle
import logging
from datetime import datetime
from pathlib import Path

from app.services.embedding_service import get_embedding_service
from app.services.llm_service import llm_service
from app.services.knowledge_loader import knowledge_loader
from app.database import SessionLocal
from app.models.chat import KnowledgeBase

logger = logging.getLogger(__name__)


class RAGService:
    """Service for RAG-based question answering using FAISS"""
    
    def __init__(self, index_path: str = "faiss_index"):
        """
        Initialize RAG service with FAISS
        
        Args:
            index_path: Directory path to store FAISS index files
        """
        self.index_path = Path(index_path)
        self.index_path.mkdir(exist_ok=True)
        self.embedding_service = get_embedding_service()
        self.llm_service = llm_service
        self.index: Optional[faiss.Index] = None
        self.documents: List[Dict] = []
        self.metadatas: List[Dict] = []
        self._initialize_vector_db()
    
    def _initialize_vector_db(self):
        """Initialize FAISS index"""
        try:
            logger.info("Initializing FAISS vector database")
            
            # Try to load existing index
            index_file = self.index_path / "faiss.index"
            metadata_file = self.index_path / "metadata.pkl"
            documents_file = self.index_path / "documents.pkl"
            
            if index_file.exists() and metadata_file.exists() and documents_file.exists():
                logger.info("Loading existing FAISS index")
                self.index = faiss.read_index(str(index_file))
                
                with open(metadata_file, 'rb') as f:
                    self.metadatas = pickle.load(f)
                
                with open(documents_file, 'rb') as f:
                    self.documents = pickle.load(f)
                
                logger.info(f"FAISS index loaded with {self.index.ntotal} vectors")
            else:
                logger.info("No existing FAISS index found, will create on first indexing")
                self.index = None
                
        except Exception as e:
            logger.error(f"Failed to initialize FAISS: {e}")
            self.index = None
    
    def index_knowledge_base(self, use_file_kb: bool = True) -> Dict[str, any]:
        """
        Index all knowledge base articles into FAISS vector store
        
        Args:
            use_file_kb: If True, use file-based knowledge loader (default)
                        If False, use database KnowledgeBase table
        
        Returns:
            Dictionary with indexing results
        """
        if not self.embedding_service.is_available():
            return {"success": False, "error": "Embedding service not available"}
        
        try:
            if use_file_kb:
                # Use file-based knowledge loader
                documents = knowledge_loader.documents
                if not documents:
                    # Try to load if not already loaded
                    documents = knowledge_loader.load_all_documents()
                
                if not documents:
                    return {"success": True, "indexed": 0, "message": "No documents to index"}
                
                # Prepare texts and metadata
                texts = []
                metadatas = []
                
                for i, doc in enumerate(documents):
                    # Use full content for embedding
                    text = f"{doc['title']}\n\n{doc['content']}"
                    texts.append(text)
                    
                    metadatas.append({
                        "doc_id": str(i),
                        "title": doc['title'],
                        "category": doc['category'],
                        "subcategory": doc['subcategory'],
                        "file_name": doc['file_name'],
                        "tags": ','.join(doc['tags']) if doc['tags'] else "",
                        "keywords": ','.join(doc['keywords']) if doc['keywords'] else "",
                        "content": text
                    })
                
                # Generate embeddings in batches
                logger.info(f"Generating embeddings for {len(texts)} documents...")
                embeddings = self.embedding_service.encode(texts)
                if embeddings is None:
                    return {"success": False, "error": "Failed to generate embeddings"}
                
                # Create FAISS index
                dimension = embeddings.shape[1]
                logger.info(f"Creating FAISS index with dimension {dimension}")
                
                # Use IndexFlatL2 for exact search (can be changed to IndexIVFFlat for larger datasets)
                self.index = faiss.IndexFlatL2(dimension)
                
                # Add vectors to index
                self.index.add(embeddings.astype('float32'))
                
                # Store documents and metadata
                self.documents = texts
                self.metadatas = metadatas
                
                # Save index to disk
                index_file = self.index_path / "faiss.index"
                metadata_file = self.index_path / "metadata.pkl"
                documents_file = self.index_path / "documents.pkl"
                
                faiss.write_index(self.index, str(index_file))
                
                with open(metadata_file, 'wb') as f:
                    pickle.dump(self.metadatas, f)
                
                with open(documents_file, 'wb') as f:
                    pickle.dump(self.documents, f)
                
                logger.info(f"Indexed {len(documents)} knowledge base documents into FAISS")
                return {
                    "success": True,
                    "indexed": len(documents),
                    "message": f"Successfully indexed {len(documents)} documents into FAISS",
                    "categories": list(set(doc['category'] for doc in documents)),
                    "dimension": dimension
                }
            
            else:
                # Use database KnowledgeBase table
                db = SessionLocal()
                try:
                    articles = db.query(KnowledgeBase).filter(
                        KnowledgeBase.is_active == True
                    ).all()
                    
                    if not articles:
                        return {"success": True, "indexed": 0, "message": "No articles to index"}
                    
                    texts = []
                    metadatas = []
                    
                    for article in articles:
                        text = f"{article.title}\n\n{article.content}"
                        texts.append(text)
                        
                        metadatas.append({
                            "article_id": str(article.id),
                            "title": article.title,
                            "category": article.category or "general",
                            "tags": article.tags or "",
                            "created_at": article.created_at.isoformat() if article.created_at else "",
                            "content": text
                        })
                    
                    embeddings = self.embedding_service.encode(texts)
                    if embeddings is None:
                        return {"success": False, "error": "Failed to generate embeddings"}
                    
                    # Create FAISS index
                    dimension = embeddings.shape[1]
                    self.index = faiss.IndexFlatL2(dimension)
                    self.index.add(embeddings.astype('float32'))
                    
                    self.documents = texts
                    self.metadatas = metadatas
                    
                    # Save to disk
                    index_file = self.index_path / "faiss.index"
                    metadata_file = self.index_path / "metadata.pkl"
                    documents_file = self.index_path / "documents.pkl"
                    
                    faiss.write_index(self.index, str(index_file))
                    
                    with open(metadata_file, 'wb') as f:
                        pickle.dump(self.metadatas, f)
                    
                    with open(documents_file, 'wb') as f:
                        pickle.dump(self.documents, f)
                
                    logger.info(f"Indexed {len(articles)} knowledge base articles into FAISS")
                    return {
                        "success": True,
                        "indexed": len(articles),
                        "message": f"Successfully indexed {len(articles)} articles into FAISS"
                    }
                finally:
                    db.close()
            
        except Exception as e:
            logger.error(f"Error indexing knowledge base: {e}")
            return {"success": False, "error": str(e)}          
    
    def retrieve_relevant_docs(
        self,
        query: str,
        top_k: int = 5,
        category_filter: Optional[str] = None
    ) -> List[Dict[str, any]]:
        """
        Retrieve relevant documents for a query using FAISS
        
        Args:
            query: User query
            top_k: Number of documents to retrieve
            category_filter: Optional category to filter by
            
        Returns:
            List of relevant documents with metadata
        """
        if not self.index or not self.embedding_service.is_available():
            logger.error("FAISS index or embedding service not available")
            return []
        
        try:
            # Generate query embedding
            query_embedding = self.embedding_service.encode_single(query)
            if query_embedding is None:
                return []
            
            # Search FAISS index
            query_vector = query_embedding.astype('float32').reshape(1, -1)
            
            # Get more results if filtering by category
            search_k = top_k * 3 if category_filter else top_k
            distances, indices = self.index.search(query_vector, min(search_k, self.index.ntotal))
            
            # Format results
            documents = []
            for i, idx in enumerate(indices[0]):
                if idx == -1:  # FAISS returns -1 for empty results
                    continue
                
                metadata = self.metadatas[idx]
                
                # Apply category filter if specified
                if category_filter and metadata.get('category') != category_filter:
                    continue
                
                documents.append({
                    "content": metadata.get('content', self.documents[idx]),
                    "metadata": metadata,
                    "distance": float(distances[0][i]),
                    "similarity": 1.0 / (1.0 + float(distances[0][i]))  # Convert distance to similarity
                })
                
                # Stop if we have enough results
                if len(documents) >= top_k:
                    break
            
            return documents
            
        except Exception as e:
            logger.error(f"Error retrieving documents from FAISS: {e}")
            return []
    
    def generate_response(
        self,
        query: str,
        context_docs: List[Dict[str, any]],
        conversation_history: Optional[List[Dict[str, str]]] = None,
        customer_context: Optional[Dict] = None
    ) -> Tuple[str, List[str]]:
        """
        Generate response using LLM with retrieved context and customer data
        
        Args:
            query: User query
            context_docs: Retrieved relevant documents
            conversation_history: Previous conversation messages
            customer_context: Customer's order and refund data
            
        Returns:
            Tuple of (response text, list of source article IDs)
        """
        if not self.llm_service.check_health():
            return "I apologize, but I'm currently unable to process your request. Please try again later or contact support.", []
        
        # Build context from retrieved documents
        context_parts = []
        source_ids = []
        
        for i, doc in enumerate(context_docs, 1):
            context_parts.append(f"[Source {i}] {doc['content']}")
            if 'metadata' in doc and 'article_id' in doc['metadata']:
                source_ids.append(doc['metadata']['article_id'])
        
        context_text = "\n\n".join(context_parts) if context_parts else "No relevant information found."
        
        # Build conversation context
        history_text = ""
        if conversation_history:
            history_parts = []
            for msg in conversation_history[-5:]:  # Last 5 messages
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                history_parts.append(f"{role.capitalize()}: {content}")
            history_text = "\n".join(history_parts)
        
        # Build customer context section
        customer_context_text = ""
        if customer_context and customer_context.get('has_orders'):
            customer_context_text = "\n\nCustomer's Account Information:\n"
            
            # Add recent orders
            if customer_context.get('recent_orders'):
                customer_context_text += "\nRecent Orders:\n"
                for order in customer_context['recent_orders'][:3]:  # Show top 3
                    items_text = ", ".join([f"{item['product_name']} (x{item['quantity']})" for item in order['items'][:2]])
                    customer_context_text += f"- Order #{order['order_number']}: {order['status']}, ${order['total']:.2f}, Items: {items_text}\n"
                    if order.get('tracking_number'):
                        customer_context_text += f"  Tracking: {order['tracking_number']}\n"
            
            # Add pending refunds
            if customer_context.get('pending_refunds'):
                customer_context_text += "\nPending Refund Requests:\n"
                for refund in customer_context['pending_refunds']:
                    customer_context_text += f"- Refund for Order #{refund['order_number']}: {refund['status']}, ${refund['amount']:.2f}\n"
                    customer_context_text += f"  Reason: {refund['reason']}\n"
            
            # Add pending returns
            if customer_context.get('pending_returns'):
                customer_context_text += "\nPending Return Requests:\n"
                for return_req in customer_context['pending_returns']:
                    customer_context_text += f"- Return for Order #{return_req['order_number']}: {return_req['status']}\n"
                    if return_req.get('tracking_number'):
                        customer_context_text += f"  Return Tracking: {return_req['tracking_number']}\n"
        
        # Create prompt
        system_prompt = """You are a helpful and empathetic customer support assistant for Intellica, an e-commerce platform. 
Your role is to help customers with returns, refunds, and general support questions.
Always be professional, friendly, and customer-focused.
When you have access to the customer's order information, use it to provide personalized, specific answers."""

        # Build conversation section
        conversation_section = ""
        if history_text:
            conversation_section = f"Previous Conversation:\n{history_text}\n\n"
        
        prompt = f"""Answer the customer's question using the provided knowledge base information and their account data.

Knowledge Base Context:
{context_text}
{customer_context_text}

{conversation_section}Customer Question: {query}

Instructions:
- Provide a clear, helpful, and professional response
- Use information from the knowledge base when relevant
- If you have the customer's order/refund information, reference it specifically in your answer
- If the customer asks about "my order" or "my refund", use their actual order data
- If the knowledge base doesn't contain the answer, politely say so and offer to connect them with a human agent
- Be empathetic and understanding
- Keep responses concise but complete (2-4 sentences)
- Use a friendly, conversational tone
- If discussing policies, explain them in simple terms

Response:"""
        
        # Generate response
        result = self.llm_service.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=500
        )
        response = result.get('text', 'Unable to generate response')
        
        return response, source_ids
    
    def answer_question(
        self,
        query: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        category_filter: Optional[str] = None,
        top_k: int = 5,
        customer_context: Optional[Dict] = None
    ) -> Dict[str, any]:
        """
        Complete RAG pipeline: retrieve and generate answer with customer context
        
        Args:
            query: User query
            conversation_history: Previous conversation messages
            category_filter: Optional category filter
            top_k: Number of documents to retrieve
            customer_context: Customer's order and refund data
            
        Returns:
            Dictionary with response and metadata
        """
        # Retrieve relevant documents
        docs = self.retrieve_relevant_docs(query, top_k, category_filter)
        
        # Generate response with customer context
        response, source_ids = self.generate_response(
            query, 
            docs, 
            conversation_history,
            customer_context
        )
        
        return {
            "response": response,
            "sources": source_ids,
            "retrieved_docs": len(docs),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def is_available(self) -> bool:
        """Check if RAG service is fully available"""
        return (
            self.index is not None and
            self.embedding_service.is_available() and
            self.llm_service.check_health()
        )


# Global instance
_rag_service: Optional[RAGService] = None


def get_rag_service() -> RAGService:
    """Get or create global RAG service instance"""
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service
