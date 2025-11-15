"""
Vision Service for Image Analysis
Handles product verification and damage detection for refund requests
"""
from typing import Dict, Optional, List
import logging
from PIL import Image
import io
import torch
from transformers import CLIPProcessor, CLIPModel
import numpy as np

logger = logging.getLogger(__name__)


class VisionService:
    """Service for image analysis using CLIP"""
    
    def __init__(self, model_name: str = "openai/clip-vit-base-patch32"):
        """
        Initialize vision service
        
        Args:
            model_name: HuggingFace model name for vision
        """
        self.model_name = model_name
        self.model: Optional[CLIPModel] = None
        self.processor: Optional[CLIPProcessor] = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Load the CLIP model"""
        try:
            logger.info(f"Loading vision model: {self.model_name}")
            self.processor = CLIPProcessor.from_pretrained(self.model_name)
            self.model = CLIPModel.from_pretrained(self.model_name)
            
            # Move to GPU if available
            if torch.cuda.is_available():
                self.model = self.model.cuda()
                logger.info("Vision model loaded on GPU")
            else:
                logger.info("Vision model loaded on CPU")
                
        except Exception as e:
            logger.error(f"Failed to load vision model: {e}")
            self.model = None
            self.processor = None
    
    def analyze_product_image(
        self,
        image_bytes: bytes,
        product_description: str
    ) -> Dict[str, any]:
        """
        Analyze product image for refund verification
        
        Args:
            image_bytes: Image file bytes
            product_description: Expected product description
            
        Returns:
            Dictionary with analysis results
        """
        if not self.is_available():
            return {
                "success": False,
                "error": "Vision service not available"
            }
        
        try:
            # Load image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Define condition categories
            conditions = [
                "new and unused product",
                "slightly used product",
                "heavily used product",
                "damaged product",
                "broken product"
            ]
            
            # Define authenticity checks
            authenticity_checks = [
                f"authentic {product_description}",
                f"counterfeit {product_description}",
                "empty box",
                "wrong product"
            ]
            
            # Analyze condition
            condition_scores = self._classify_image(image, conditions)
            
            # Analyze authenticity
            authenticity_scores = self._classify_image(image, authenticity_checks)
            
            # Determine overall assessment
            top_condition = max(condition_scores.items(), key=lambda x: x[1])
            top_authenticity = max(authenticity_scores.items(), key=lambda x: x[1])
            
            # Calculate fraud risk score (0-100)
            fraud_score = self._calculate_fraud_score(
                condition_scores,
                authenticity_scores
            )
            
            return {
                "success": True,
                "condition": {
                    "assessment": top_condition[0],
                    "confidence": float(top_condition[1]),
                    "all_scores": {k: float(v) for k, v in condition_scores.items()}
                },
                "authenticity": {
                    "assessment": top_authenticity[0],
                    "confidence": float(top_authenticity[1]),
                    "all_scores": {k: float(v) for k, v in authenticity_scores.items()}
                },
                "fraud_score": fraud_score,
                "risk_level": self._get_risk_level(fraud_score),
                "recommendations": self._generate_recommendations(
                    top_condition[0],
                    top_authenticity[0],
                    fraud_score
                )
            }
            
        except Exception as e:
            logger.error(f"Error analyzing image: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _classify_image(
        self,
        image: Image.Image,
        text_labels: List[str]
    ) -> Dict[str, float]:
        """
        Classify image against text labels using CLIP
        
        Args:
            image: PIL Image
            text_labels: List of text descriptions
            
        Returns:
            Dictionary mapping labels to scores
        """
        # Prepare inputs
        inputs = self.processor(
            text=text_labels,
            images=image,
            return_tensors="pt",
            padding=True
        )
        
        # Move to GPU if available
        if torch.cuda.is_available():
            inputs = {k: v.cuda() for k, v in inputs.items()}
        
        # Get predictions
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits_per_image = outputs.logits_per_image
            probs = logits_per_image.softmax(dim=1)
        
        # Convert to dictionary
        scores = {}
        for i, label in enumerate(text_labels):
            scores[label] = probs[0][i].item()
        
        return scores
    
    def _calculate_fraud_score(
        self,
        condition_scores: Dict[str, float],
        authenticity_scores: Dict[str, float]
    ) -> int:
        """
        Calculate fraud risk score based on analysis
        
        Args:
            condition_scores: Condition assessment scores
            authenticity_scores: Authenticity assessment scores
            
        Returns:
            Fraud score (0-100)
        """
        fraud_indicators = 0.0
        
        # Check for counterfeit indicators
        for key, score in authenticity_scores.items():
            if 'counterfeit' in key.lower() or 'wrong' in key.lower() or 'empty' in key.lower():
                fraud_indicators += score * 50
        
        # Check for condition mismatches
        if condition_scores.get('broken product', 0) > 0.5:
            fraud_indicators += 30
        elif condition_scores.get('damaged product', 0) > 0.5:
            fraud_indicators += 20
        
        return min(int(fraud_indicators), 100)
    
    def _get_risk_level(self, fraud_score: int) -> str:
        """Get risk level from fraud score"""
        if fraud_score >= 70:
            return "high"
        elif fraud_score >= 40:
            return "medium"
        else:
            return "low"
    
    def _generate_recommendations(
        self,
        condition: str,
        authenticity: str,
        fraud_score: int
    ) -> List[str]:
        """Generate recommendations based on analysis"""
        recommendations = []
        
        if fraud_score >= 70:
            recommendations.append("Recommend manual review by supervisor")
            recommendations.append("Request additional photos from customer")
        
        if 'counterfeit' in authenticity.lower() or 'wrong' in authenticity.lower():
            recommendations.append("Verify product authenticity with vendor")
            recommendations.append("Check customer purchase history")
        
        if 'broken' in condition.lower() or 'damaged' in condition.lower():
            recommendations.append("Assess if damage occurred during shipping")
            recommendations.append("Review packaging condition")
        
        if not recommendations:
            recommendations.append("Standard refund process can proceed")
        
        return recommendations
    
    def is_available(self) -> bool:
        """Check if vision service is available"""
        return self.model is not None and self.processor is not None


# Global instance
_vision_service: Optional[VisionService] = None


def get_vision_service() -> VisionService:
    """Get or create global vision service instance"""
    global _vision_service
    if _vision_service is None:
        _vision_service = VisionService()
    return _vision_service
