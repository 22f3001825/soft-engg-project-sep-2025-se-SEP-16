"""
RAG (Retrieval-Augmented Generation) Service
Handles knowledge base retrieval and response generation
"""
from typing import List, Dict, Optional, Tuple
import chromadb
from chromadb.config import Settings
import logging
from datetime import datetime

from app.services.embedding_service import get_embedding_service
from app.services.llm_service import llm_service
from app.services.knowledge_loader import knowledge_loader
from app.database import SessionLocal
from app.models.chat import KnowledgeBase

logger = logging.getLogger(__name__)


class RAGService:
    """Service for RAG-based question answering"""
    
    def __init__(self, collection_name: str = "knowledge_base"):
        """
        Initialize RAG service
        
        Args:
            collection_name: Name of ChromaDB collection
        """
        self.collection_name = collection_name
        self.embedding_service = get_embedding_service()
        self.llm_service = llm_service
        self.client: Optional[chromadb.Client] = None
        self.collection = None
        self._initialize_vector_db()
    
    def _initialize_vector_db(self):
        """Initialize ChromaDB client and collection"""
        try:
            logger.info("Initializing ChromaDB")
            self.client = chromadb.Client(Settings(
                anonymized_telemetry=False,
                allow_reset=True
            ))
            
            # Get or create collection
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"description": "Knowledge base for customer support"}
            )
            logger.info(f"ChromaDB collection '{self.collection_name}' ready")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            self.client = None
            self.collection = None
    
    def index_knowledge_base(self, use_file_kb: bool = True) -> Dict[str, any]:
        """
        Index all knowledge base articles into vector store
        
        Args:
            use_file_kb: If True, use file-based knowledge loader (default)
                        If False, use database KnowledgeBase table
        
        Returns:
            Dictionary with indexing results
        """
        if not self.collection or not self.embedding_service.is_available():
            return {"success": False, "error": "Services not available"}
        
        try:
            if use_file_kb:
                # Use file-based knowledge loader (46 documents)
                documents = knowledge_loader.documents
                if not documents:
                    # Try to load if not already loaded
                    documents = knowledge_loader.load_all_documents()
                
                if not documents:
                    return {"success": True, "indexed": 0, "message": "No documents to index"}
                
                # Prepare texts and metadata
                texts = []
                metadatas = []
                ids = []
                
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
                        "keywords": ','.join(doc['keywords']) if doc['keywords'] else ""
                    })
                    
                    ids.append(f"doc_{i}")
                
                # Generate embeddings in batches
                logger.info(f"Generating embeddings for {len(texts)} documents...")
                embeddings = self.embedding_service.encode(texts)
                if embeddings is None:
                    return {"success": False, "error": "Failed to generate embeddings"}
                
                # Clear existing collection and add new documents
                try:
                    self.client.delete_collection(self.collection_name)
                    self.collection = self.client.create_collection(
                        name=self.collection_name,
                        metadata={"description": "Knowledge base for customer support"}
                    )
                except:
                    pass
                
                # Add to ChromaDB
                self.collection.add(
                    embeddings=embeddings.tolist(),
                    documents=texts,
                    metadatas=metadatas,
                    ids=ids
                )
                
                logger.info(f"Indexed {len(documents)} knowledge base documents")
                return {
                    "success": True,
                    "indexed": len(documents),
                    "message": f"Successfully indexed {len(documents)} documents",
                    "categories": list(set(doc['category'] for doc in documents))
                }
            
            else:
                # Use database KnowledgeBase table (original implementation)
                db = SessionLocal()
                try:
                    articles = db.query(KnowledgeBase).filter(
                        KnowledgeBase.is_active == True
                    ).all()
                    
                    if not articles:
                        return {"success": True, "indexed": 0, "message": "No articles to index"}
                    
                    texts = []
                    metadatas = []
                    ids = []
                    
                    for article in articles:
                        text = f"{article.title}\n\n{article.content}"
                        texts.append(text)
                        
                        metadatas.append({
                            "article_id": str(article.id),
                            "title": article.title,
                            "category": article.category or "general",
                            "tags": article.tags or "",
                            "created_at": article.created_at.isoformat() if article.created_at else ""
                        })
                        
                        ids.append(f"kb_{article.id}")
                    
                    embeddings = self.embedding_service.encode(texts)
                    if embeddings is None:
                        return {"success": False, "error": "Failed to generate embeddings"}
                    
                    self.collection.add(
                        embeddings=embeddings.tolist(),
                        documents=texts,
                        metadatas=metadatas,
                        ids=ids
                    )
                    
                    logger.info(f"Indexed {len(articles)} knowledge base articles")
                    return {
                        "success": True,
                        "indexed": len(articles),
                        "message": f"Successfully indexed {len(articles)} articles"
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
        Retrieve relevant documents for a query
        
        Args:
            query: User query
            top_k: Number of documents to retrieve
            category_filter: Optional category to filter by
            
        Returns:
            List of relevant documents with metadata
        """
        if not self.collection or not self.embedding_service.is_available():
            logger.error("RAG services not available")
            return []
        
        try:
            # Generate query embedding
            query_embedding = self.embedding_service.encode_single(query)
            if query_embedding is None:
                return []
            
            # Build where filter if category specified
            where_filter = None
            if category_filter:
                where_filter = {"category": category_filter}
            
            # Query ChromaDB
            results = self.collection.query(
                query_embeddings=[query_embedding.tolist()],
                n_results=top_k,
                where=where_filter
            )
            
            # Format results
            documents = []
            if results and results['documents'] and results['documents'][0]:
                for i, doc in enumerate(results['documents'][0]):
                    documents.append({
                        "content": doc,
                        "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                        "distance": results['distances'][0][i] if results['distances'] else 0.0
                    })
            
            return documents
            
        except Exception as e:
            logger.error(f"Error retrieving documents: {e}")
            return []
    
    def generate_response(
        self,
        query: str,
        context_docs: List[Dict[str, any]],
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Tuple[str, List[str]]:
        """
        Generate response using LLM with retrieved context
        
        Args:
            query: User query
            context_docs: Retrieved relevant documents
            conversation_history: Previous conversation messages
            
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
        
        # Create prompt
        system_prompt = """You are a helpful and empathetic customer support assistant for Intellica, an e-commerce platform. 
Your role is to help customers with returns, refunds, and general support questions.
Always be professional, friendly, and customer-focused."""

        prompt = f"""Answer the customer's question using the provided knowledge base information.

Knowledge Base Context:
{context_text}

{("Previous Conversation:\n" + history_text + "\n") if history_text else ""}
Customer Question: {query}

Instructions:
- Provide a clear, helpful, and professional response
- Use information from the knowledge base when relevant
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
        top_k: int = 5
    ) -> Dict[str, any]:
        """
        Complete RAG pipeline: retrieve and generate answer
        
        Args:
            query: User query
            conversation_history: Previous conversation messages
            category_filter: Optional category filter
            top_k: Number of documents to retrieve
            
        Returns:
            Dictionary with response and metadata
        """
        # Retrieve relevant documents
        docs = self.retrieve_relevant_docs(query, top_k, category_filter)
        
        # Generate response
        response, source_ids = self.generate_response(query, docs, conversation_history)
        
        return {
            "response": response,
            "sources": source_ids,
            "retrieved_docs": len(docs),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def is_available(self) -> bool:
        """Check if RAG service is fully available"""
        return (
            self.collection is not None and
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
