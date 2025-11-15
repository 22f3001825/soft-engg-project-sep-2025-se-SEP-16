"""
Embedding Service for RAG
Handles text embedding generation for semantic search
"""
from typing import List, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for generating text embeddings"""
    
    def __init__(self, model_name: str = "BAAI/bge-m3"):
        """
        Initialize embedding service
        
        Args:
            model_name: HuggingFace model name for embeddings
        """
        self.model_name = model_name
        self.model: Optional[SentenceTransformer] = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Load the embedding model"""
        try:
            logger.info(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            logger.info("Embedding model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            # Fallback to smaller model
            try:
                self.model_name = "sentence-transformers/all-MiniLM-L6-v2"
                logger.info(f"Falling back to: {self.model_name}")
                self.model = SentenceTransformer(self.model_name)
            except Exception as e2:
                logger.error(f"Fallback model also failed: {e2}")
                self.model = None
    
    def encode(self, texts: List[str], batch_size: int = 32) -> Optional[np.ndarray]:
        """
        Generate embeddings for a list of texts
        
        Args:
            texts: List of text strings to embed
            batch_size: Batch size for encoding
            
        Returns:
            Numpy array of embeddings or None if model unavailable
        """
        if not self.model:
            logger.error("Embedding model not available")
            return None
        
        try:
            embeddings = self.model.encode(
                texts,
                batch_size=batch_size,
                show_progress_bar=False,
                convert_to_numpy=True
            )
            return embeddings
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            return None
    
    def encode_single(self, text: str) -> Optional[np.ndarray]:
        """
        Generate embedding for a single text
        
        Args:
            text: Text string to embed
            
        Returns:
            Numpy array embedding or None if model unavailable
        """
        result = self.encode([text])
        return result[0] if result is not None else None
    
    def get_embedding_dimension(self) -> int:
        """Get the dimension of embeddings produced by this model"""
        if not self.model:
            return 0
        return self.model.get_sentence_embedding_dimension()
    
    def is_available(self) -> bool:
        """Check if embedding service is available"""
        return self.model is not None


# Global instance
_embedding_service: Optional[EmbeddingService] = None


def get_embedding_service() -> EmbeddingService:
    """Get or create global embedding service instance"""
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service
