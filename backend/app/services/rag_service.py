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
            
            # Format results with similarity threshold
            documents = []
            SIMILARITY_THRESHOLD = 0.35  # Minimum similarity score (0-1 scale)
            
            for i, idx in enumerate(indices[0]):
                if idx == -1:  # FAISS returns -1 for empty results
                    continue
                
                metadata = self.metadatas[idx]
                
                # Calculate similarity score
                similarity = 1.0 / (1.0 + float(distances[0][i]))
                
                # Apply similarity threshold - skip irrelevant documents
                if similarity < SIMILARITY_THRESHOLD:
                    logger.debug(f"Skipping document with low similarity: {similarity:.3f}")
                    continue
                
                # Apply category filter if specified
                if category_filter and metadata.get('category') != category_filter:
                    continue
                
                documents.append({
                    "content": metadata.get('content', self.documents[idx]),
                    "metadata": metadata,
                    "distance": float(distances[0][i]),
                    "similarity": similarity
                })
                
                # Stop if we have enough results
                if len(documents) >= top_k:
                    break
            
            logger.info(f"Retrieved {len(documents)} relevant documents (threshold: {SIMILARITY_THRESHOLD})")
            
            return documents
            
        except Exception as e:
            logger.error(f"Error retrieving documents from FAISS: {e}")
            return []
    
    def classify_intent(self, query: str) -> Dict[str, any]:
        """
        Classify if user query is in-scope for e-commerce support
        
        Args:
            query: User question
            
        Returns:
            Dict with 'in_scope' (bool), 'confidence' (float), 'reason' (str)
        """
        if not self.llm_service.check_health():
            # If LLM unavailable, assume in-scope to allow fallback handling
            return {"in_scope": True, "confidence": 0.5, "reason": "LLM unavailable"}
        
        system_prompt = """You are a Intellica helpful assistant that categorizes e-commercecustomer questions. If the user ask any other question other than e-commerce customer support, respond with "I apologize, but I can only assist with Intellica e-commerce support questions (orders, returns, refunds, shipping, products). For other inquiries, please contact our general support team."""
        
        prompt = f"""Is this question about e-commerce customer support (orders, returns, shipping, refunds, products, accounts)?

Question: "{query}"

Respond with only a JSON object:
{{"in_scope": true/false, "confidence": 0.0-1.0, "reason": "brief explanation"}}

Examples:
- "What is your refund policy?" → {{"in_scope": true, "confidence": 0.95, "reason": "refund question"}}
- "How do I track my order?" → {{"in_scope": true, "confidence": 0.95, "reason": "order tracking"}}
- "What is 2+2?" → {{"in_scope": false, "confidence": 0.95, "reason": "math question"}}
- "Tell me a joke" → {{"in_scope": false, "confidence": 0.95, "reason": "entertainment"}}"""
        
        result = self.llm_service.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.1,  # Very low for consistent classification
            max_tokens=100
        )
        
        if not result['success']:
            return {"in_scope": True, "confidence": 0.5, "reason": "Classification failed"}
        
        try:
            import json
            classification = json.loads(result['text'])
            return classification
        except:
            # If parsing fails, assume in-scope to be safe
            logger.warning(f"Failed to parse intent classification: {result['text']}")
            return {"in_scope": True, "confidence": 0.5, "reason": "Parse error"}
    
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
        
        # Create natural, conversational prompt (Gemini-optimized)
        system_prompt = """You are a friendly customer support assistant for Intellica, an e-commerce platform.

Your expertise: Returns, refunds, order tracking, shipping, products, and account help.

Guidelines:
- Answer questions using the Knowledge Base information provided
- If you don't have the information, say so and offer to connect them with a human agent
- For questions outside e-commerce support, politely redirect: "I specialize in Intellica orders, returns, and shipping. For other questions, please contact our general support team."
- Be helpful, friendly, and concise

Examples of good responses:
Q: "What's your refund policy?"
A: "We offer refunds within 30 days for items in original condition..."

Q: "Where's my order?"
A: "Let me help you track that. You can check your order status in your account dashboard..."

Q: "What's the weather today?"
A: "I specialize in Intellica orders, returns, and shipping. For other questions, please contact our general support team."

Now answer the customer's question following these rules strictly."""

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
- If the knowledge base doesn't contain the answer, say you don't have that information and offer to connect them with a human agent
- Be empathetic and understanding
- Keep responses concise but complete (2-3 sentences)
- Use a friendly, conversational tone

Response:"""
        
        # Generate response with optimized parameters
        result = self.llm_service.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.3,  # Lower = more focused and consistent
            max_tokens=300    # Shorter = faster responses
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
        Complete RAG pipeline with validation and intent classification
        
        Args:
            query: User query
            conversation_history: Previous conversation messages
            category_filter: Optional category filter
            top_k: Number of documents to retrieve
            customer_context: Customer's order and refund data
            
        Returns:
            Dictionary with response and metadata
        """
        # Validate query
        query = query.strip()
        
        # Handle empty query
        if not query:
            return {
                "response": "I didn't receive a question. How can I help you today?",
                "sources": [],
                "retrieved_docs": 0,
                "timestamp": datetime.utcnow().isoformat(),
                "intent_classification": {"in_scope": False, "reason": "empty_query"}
            }
        
        # Handle very short query
        if len(query) < 3:
            return {
                "response": "Could you please provide more details about what you need help with?",
                "sources": [],
                "retrieved_docs": 0,
                "timestamp": datetime.utcnow().isoformat(),
                "intent_classification": {"in_scope": False, "reason": "too_short"}
            }
        
        # Handle very long query (truncate with warning)
        MAX_QUERY_LENGTH = 500
        if len(query) > MAX_QUERY_LENGTH:
            logger.warning(f"Query too long ({len(query)} chars), truncating to {MAX_QUERY_LENGTH}")
            query = query[:MAX_QUERY_LENGTH] + "..."
        
        # PHASE 2: Intent classification - check if question is in-scope
        intent_result = self.classify_intent(query)
        
        if not intent_result.get('in_scope', True) and intent_result.get('confidence', 0) > 0.7:
            # High confidence that question is out-of-scope - refuse immediately
            logger.info(f"Refusing out-of-scope question: {query[:50]}... (confidence: {intent_result.get('confidence')})")
            return {
                "response": "I apologize, but I can only assist with Intellica e-commerce support questions (orders, returns, refunds, shipping, products). For other inquiries, please contact our general support team.",
                "sources": [],
                "retrieved_docs": 0,
                "timestamp": datetime.utcnow().isoformat(),
                "intent_classification": intent_result
            }
        
        # Retrieve relevant documents
        docs = self.retrieve_relevant_docs(query, top_k, category_filter)
        
        # If no relevant documents found, offer human agent
        if not docs:
            logger.info(f"No relevant documents found for query: {query[:50]}...")
            return {
                "response": "I don't have information about that in my knowledge base. Would you like me to connect you with a human agent who can better assist you?",
                "sources": [],
                "retrieved_docs": 0,
                "timestamp": datetime.utcnow().isoformat(),
                "intent_classification": intent_result
            }
        
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
            "timestamp": datetime.utcnow().isoformat(),
            "intent_classification": intent_result
        }
    
    def generate_conversation_summary(
        self,
        messages: List[Dict[str, str]],
        customer_context: Optional[Dict] = None
    ) -> Dict[str, any]:
        """
        Generate AI summary of a conversation
        
        Args:
            messages: List of conversation messages
            customer_context: Customer's order and refund data
            
        Returns:
            Dictionary with summary and metadata
        """
        if not self.llm_service.check_health():
            return {
                "success": False,
                "summary": "Unable to generate summary - AI service unavailable",
                "key_points": [],
                "resolution_status": "UNKNOWN"
            }
        
        # Build conversation text
        conversation_text = ""
        for msg in messages:
            role = msg.get('role', msg.get('sender_type', 'unknown'))
            content = msg.get('content', '')
            conversation_text += f"{role}: {content}\n"
        
        # Build customer context summary
        context_summary = ""
        if customer_context and customer_context.get('has_orders'):
            if customer_context.get('pending_refunds'):
                context_summary += f"\nCustomer has {len(customer_context['pending_refunds'])} pending refund(s)."
            if customer_context.get('pending_returns'):
                context_summary += f"\nCustomer has {len(customer_context['pending_returns'])} pending return(s)."
        
        system_prompt = """You are an AI assistant that summarizes customer support conversations.
Create concise, informative summaries that capture the main issue, actions taken, and resolution status."""
        
        prompt = f"""Summarize this customer support conversation.

Conversation:
{conversation_text}
{context_summary}

Provide a JSON response with:
1. summary: A 2-3 sentence summary of the conversation
2. key_points: Array of 3-5 key points from the conversation
3. main_issue: The primary issue or question (one phrase)
4. resolution_status: RESOLVED, PENDING, or ESCALATED
5. action_items: Array of any action items for the customer (if any)
6. topics: Array of main topics discussed (e.g., "refund", "order_status", "return_policy")

Format as valid JSON only."""
        
        result = self.llm_service.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.3,
            max_tokens=600
        )
        
        if not result['success']:
            return {
                "success": False,
                "summary": "Unable to generate summary",
                "key_points": [],
                "resolution_status": "UNKNOWN"
            }
        
        try:
            import json
            summary_data = json.loads(result['text'])
            summary_data['success'] = True
            summary_data['model_used'] = result.get('model', 'unknown')
            return summary_data
        except:
            # Fallback if JSON parsing fails
            return {
                "success": True,
                "summary": result['text'][:500],
                "key_points": ["Conversation summary generated"],
                "main_issue": "Customer inquiry",
                "resolution_status": "PENDING",
                "action_items": [],
                "topics": ["general"],
                "model_used": result.get('model', 'unknown')
            }
    
    def generate_refund_eligibility_summary(
        self,
        eligibility_result: Dict,
        product_category: str,
        reason: str
    ) -> Dict[str, any]:
        """
        Generate customer-friendly summary of refund eligibility check
        
        Args:
            eligibility_result: Result from eligibility check
            product_category: Product category
            reason: Reason for return
            
        Returns:
            Dictionary with summary and action items
        """
        if not self.llm_service.check_health():
            return {
                "success": False,
                "summary": "Unable to generate summary",
                "action_items": []
            }
        
        eligible = eligibility_result.get('eligible', False)
        status = eligibility_result.get('eligibility_status', 'UNKNOWN')
        reasoning = eligibility_result.get('reasoning', '')
        refund_amount = eligibility_result.get('refund_amount', 'NONE')
        
        system_prompt = """You are a customer support assistant explaining refund eligibility in a friendly, clear way.
Be empathetic and provide actionable next steps."""
        
        prompt = f"""Create a customer-friendly summary of this refund eligibility check.

Product Category: {product_category}
Return Reason: {reason}
Eligibility Status: {status}
Eligible: {eligible}
Refund Amount: {refund_amount}
Reasoning: {reasoning}

Provide a JSON response with:
1. summary: A friendly 2-3 sentence explanation of the eligibility decision
2. action_items: Array of 2-4 specific next steps the customer should take
3. estimated_timeline: Estimated time for refund processing (if eligible)
4. helpful_tips: Array of 1-2 helpful tips for the customer

Format as valid JSON only."""
        
        result = self.llm_service.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.5,
            max_tokens=400
        )
        
        if not result['success']:
            # Fallback summary
            if eligible:
                return {
                    "success": True,
                    "summary": f"Good news! Your {product_category} return is eligible for a {refund_amount.lower()} refund.",
                    "action_items": [
                        "Submit your return request through your account",
                        "Package the item securely with original packaging if possible",
                        "Wait for return shipping label via email"
                    ],
                    "estimated_timeline": "5-7 business days after we receive the item",
                    "helpful_tips": ["Keep your tracking number for reference"]
                }
            else:
                return {
                    "success": True,
                    "summary": f"Unfortunately, your {product_category} return may not be eligible based on our policy.",
                    "action_items": [
                        "Review our return policy for specific requirements",
                        "Contact customer support for special circumstances",
                        "Consider alternative solutions like exchange or store credit"
                    ],
                    "estimated_timeline": "N/A",
                    "helpful_tips": ["Our support team can help explore other options"]
                }
        
        try:
            import json
            summary_data = json.loads(result['text'])
            summary_data['success'] = True
            summary_data['model_used'] = result.get('model', 'unknown')
            return summary_data
        except:
            # Use fallback
            if eligible:
                return {
                    "success": True,
                    "summary": result['text'][:300],
                    "action_items": ["Submit return request", "Package item securely"],
                    "estimated_timeline": "5-7 business days",
                    "helpful_tips": ["Keep tracking number"],
                    "model_used": result.get('model', 'unknown')
                }
            else:
                return {
                    "success": True,
                    "summary": result['text'][:300],
                    "action_items": ["Review return policy", "Contact support"],
                    "estimated_timeline": "N/A",
                    "helpful_tips": ["Support team can help"],
                    "model_used": result.get('model', 'unknown')
                }
    
    def analyze_intent_and_sentiment(
        self,
        message: str,
        customer_context: Optional[Dict] = None
    ) -> Dict[str, any]:
        """
        Analyze intent and sentiment of a customer message
        
        Args:
            message: Customer message text
            customer_context: Customer's order and refund data
            
        Returns:
            Dictionary with intent, sentiment, and confidence scores
        """
        if not self.llm_service.check_health():
            return {
                "success": False,
                "intent": "unknown",
                "intent_confidence": 0.0,
                "sentiment": "neutral",
                "sentiment_score": 0.5,
                "entities": {}
            }
        
        # Build context summary
        context_info = ""
        if customer_context and customer_context.get('has_orders'):
            if customer_context.get('pending_refunds'):
                context_info += "\nCustomer has pending refund requests."
            if customer_context.get('pending_returns'):
                context_info += "\nCustomer has pending return requests."
        
        system_prompt = """You are an AI assistant that analyzes customer support messages.
Detect the customer's intent and sentiment accurately."""
        
        prompt = f"""Analyze this customer message for intent and sentiment.

Customer Message: "{message}"
{context_info}

Provide a JSON response with:
1. intent: One of these categories:
   - refund_inquiry: Asking about refunds or refund status
   - return_inquiry: Asking about returns or return process
   - order_status: Asking about order status or tracking
   - product_inquiry: Questions about products
   - policy_question: Questions about policies
   - complaint: Expressing dissatisfaction or complaint
   - general_question: General inquiries
   - greeting: Just saying hello or starting conversation
   - other: Doesn't fit other categories

2. intent_confidence: Confidence score 0.0-1.0

3. sentiment: One of:
   - positive: Happy, satisfied, grateful
   - neutral: Factual, informational
   - negative: Unhappy, frustrated, angry

4. sentiment_score: Score 0.0-1.0 (0=very negative, 0.5=neutral, 1.0=very positive)

5. entities: Object with extracted information:
   - order_number: If mentioned (or null)
   - product_name: If mentioned (or null)
   - amount: If mentioned (or null)

Format as valid JSON only."""
        
        result = self.llm_service.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.2,  # Low temperature for consistent classification
            max_tokens=300
        )
        
        if not result['success']:
            # Fallback: simple keyword-based detection
            return self._fallback_intent_sentiment(message)
        
        try:
            import json
            analysis = json.loads(result['text'])
            analysis['success'] = True
            analysis['model_used'] = result.get('model', 'unknown')
            return analysis
        except:
            # Use fallback
            return self._fallback_intent_sentiment(message)
    
    def _fallback_intent_sentiment(self, message: str) -> Dict[str, any]:
        """
        Fallback intent and sentiment detection using keywords
        """
        message_lower = message.lower()
        
        # Intent detection
        intent = "general_question"
        intent_confidence = 0.6
        
        if any(word in message_lower for word in ['refund', 'money back', 'reimburse']):
            intent = "refund_inquiry"
            intent_confidence = 0.7
        elif any(word in message_lower for word in ['return', 'send back', 'give back']):
            intent = "return_inquiry"
            intent_confidence = 0.7
        elif any(word in message_lower for word in ['order', 'tracking', 'delivery', 'shipped']):
            intent = "order_status"
            intent_confidence = 0.7
        elif any(word in message_lower for word in ['policy', 'rule', 'guideline']):
            intent = "policy_question"
            intent_confidence = 0.7
        elif any(word in message_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good afternoon']):
            intent = "greeting"
            intent_confidence = 0.8
        elif any(word in message_lower for word in ['angry', 'frustrated', 'disappointed', 'terrible', 'awful']):
            intent = "complaint"
            intent_confidence = 0.7
        
        # Sentiment detection
        sentiment = "neutral"
        sentiment_score = 0.5
        
        positive_words = ['thank', 'thanks', 'great', 'excellent', 'good', 'happy', 'appreciate', 'perfect']
        negative_words = ['bad', 'terrible', 'awful', 'angry', 'frustrated', 'disappointed', 'upset', 'horrible']
        
        positive_count = sum(1 for word in positive_words if word in message_lower)
        negative_count = sum(1 for word in negative_words if word in message_lower)
        
        if positive_count > negative_count:
            sentiment = "positive"
            sentiment_score = min(0.7 + (positive_count * 0.1), 1.0)
        elif negative_count > positive_count:
            sentiment = "negative"
            sentiment_score = max(0.3 - (negative_count * 0.1), 0.0)
        
        return {
            "success": True,
            "intent": intent,
            "intent_confidence": intent_confidence,
            "sentiment": sentiment,
            "sentiment_score": sentiment_score,
            "entities": {},
            "model_used": "fallback"
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
