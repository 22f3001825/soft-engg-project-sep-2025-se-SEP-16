"""
Refund Eligibility Verification Service
Uses RAG to determine refund eligibility based on policies
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging

from app.services.rag_service import get_rag_service
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)


class RefundEligibilityService:
    """Service for verifying refund eligibility using RAG"""
    
    def __init__(self):
        self.rag_service = get_rag_service()
        self.llm_service = llm_service
    
    def check_eligibility(
        self,
        product_category: str,
        purchase_date: datetime,
        reason: str,
        condition: str = "unused",
        has_packaging: bool = True,
        has_receipt: bool = True,
        additional_info: Optional[str] = None
    ) -> Dict[str, any]:
        """
        Check refund eligibility based on policies
        
        Args:
            product_category: Category of product (Electronics, Apparel, Food, etc.)
            purchase_date: Date of purchase
            reason: Reason for return
            condition: Product condition (unused, opened, damaged, etc.)
            has_packaging: Whether original packaging is available
            has_receipt: Whether receipt/proof of purchase is available
            additional_info: Any additional context
            
        Returns:
            Dictionary with eligibility decision and reasoning
        """
        # Calculate days since purchase
        days_since_purchase = (datetime.now() - purchase_date).days
        
        # Build eligibility query
        query = f"""
I need to check if I'm eligible for a refund:
- Product Category: {product_category}
- Days since purchase: {days_since_purchase}
- Reason for return: {reason}
- Product condition: {condition}
- Original packaging: {'Yes' if has_packaging else 'No'}
- Receipt available: {'Yes' if has_receipt else 'No'}
{f'- Additional info: {additional_info}' if additional_info else ''}

Am I eligible for a refund?
"""
        
        # Retrieve relevant policy documents
        docs = self.rag_service.retrieve_relevant_docs(
            query=query,
            top_k=5,
            category_filter=None  # Search all customer docs
        )
        
        # Filter for customer-facing policy docs
        policy_docs = [
            doc for doc in docs 
            if 'customer' in doc.get('metadata', {}).get('subcategory', '').lower()
        ]
        
        if not policy_docs:
            policy_docs = docs  # Use all docs if no customer docs found
        
        # Build context from policies
        context_parts = []
        for i, doc in enumerate(policy_docs[:3], 1):
            context_parts.append(f"[Policy {i}]\n{doc['content']}")
        
        context_text = "\n\n".join(context_parts)
        
        # Create structured prompt for eligibility check
        system_prompt = """You are a refund eligibility verification assistant. 
Analyze the customer's situation against company policies and provide a clear eligibility decision.
Be fair, accurate, and customer-friendly in your assessment."""
        
        prompt = f"""Based on the company's return and refund policies, determine if this customer is eligible for a refund.

Company Policies:
{context_text}

Customer Situation:
- Product Category: {product_category}
- Days since purchase: {days_since_purchase}
- Reason: {reason}
- Condition: {condition}
- Original packaging: {'Yes' if has_packaging else 'No'}
- Receipt: {'Yes' if has_receipt else 'No'}
{f'- Additional info: {additional_info}' if additional_info else ''}

Provide your assessment in the following format:

ELIGIBILITY: [ELIGIBLE / PARTIAL / NOT_ELIGIBLE]
CONFIDENCE: [HIGH / MEDIUM / LOW]

REASONING:
[Explain why based on specific policies]

REFUND_AMOUNT: [FULL / PARTIAL / NONE]
[If partial, explain percentage or deductions]

NEXT_STEPS:
[What the customer should do next]

POLICY_REFERENCES:
[List specific policies that apply]
"""
        
        # Generate eligibility decision
        result = self.llm_service.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.3,  # Lower temperature for more consistent decisions
            max_tokens=800
        )
        
        response_text = result.get('text', '')
        
        # Parse the response
        eligibility_result = self._parse_eligibility_response(
            response_text,
            days_since_purchase,
            product_category,
            reason
        )
        
        # Add metadata
        eligibility_result['query'] = query
        eligibility_result['policies_checked'] = len(policy_docs)
        eligibility_result['model_used'] = result.get('model', 'unknown')
        eligibility_result['timestamp'] = datetime.utcnow().isoformat()
        
        return eligibility_result
    
    def _parse_eligibility_response(
        self,
        response: str,
        days_since_purchase: int,
        category: str,
        reason: str
    ) -> Dict[str, any]:
        """Parse LLM response into structured format"""
        
        # Default values
        result = {
            "eligible": False,
            "eligibility_status": "NOT_ELIGIBLE",
            "confidence": "MEDIUM",
            "reasoning": "",
            "refund_amount": "NONE",
            "refund_percentage": 0,
            "next_steps": [],
            "policy_references": [],
            "warnings": [],
            "full_response": response
        }
        
        # Parse response sections
        lines = response.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('ELIGIBILITY:'):
                status = line.split(':', 1)[1].strip().upper()
                result['eligibility_status'] = status
                result['eligible'] = status in ['ELIGIBLE', 'PARTIAL']
            
            elif line.startswith('CONFIDENCE:'):
                result['confidence'] = line.split(':', 1)[1].strip().upper()
            
            elif line.startswith('REASONING:'):
                current_section = 'reasoning'
            
            elif line.startswith('REFUND_AMOUNT:'):
                amount = line.split(':', 1)[1].strip().upper()
                result['refund_amount'] = amount
                if 'FULL' in amount:
                    result['refund_percentage'] = 100
                elif 'PARTIAL' in amount:
                    result['refund_percentage'] = 70  # Default partial
                else:
                    result['refund_percentage'] = 0
            
            elif line.startswith('NEXT_STEPS:'):
                current_section = 'next_steps'
            
            elif line.startswith('POLICY_REFERENCES:'):
                current_section = 'policy_references'
            
            elif line and current_section:
                if current_section == 'reasoning':
                    result['reasoning'] += line + ' '
                elif current_section == 'next_steps' and line.startswith('-'):
                    result['next_steps'].append(line[1:].strip())
                elif current_section == 'policy_references' and line.startswith('-'):
                    result['policy_references'].append(line[1:].strip())
        
        # Add automatic warnings based on rules
        if days_since_purchase > 30:
            result['warnings'].append("Return window may have expired")
        
        if days_since_purchase > 45:
            result['eligible'] = False
            result['eligibility_status'] = "NOT_ELIGIBLE"
            result['warnings'].append("Definitely past return window (45+ days)")
        
        # Clean up reasoning
        result['reasoning'] = result['reasoning'].strip()
        
        return result
    
    def get_return_window(self, product_category: str) -> Dict[str, any]:
        """
        Get return window information for a product category
        
        Args:
            product_category: Category of product
            
        Returns:
            Dictionary with return window details
        """
        query = f"What is the return window for {product_category} products?"
        
        docs = self.rag_service.retrieve_relevant_docs(query, top_k=3)
        
        # Default windows
        windows = {
            "electronics": 14,
            "food": 7,
            "apparel": 30,
            "home": 30,
            "default": 30
        }
        
        category_lower = product_category.lower()
        days = windows.get(category_lower, windows['default'])
        
        return {
            "category": product_category,
            "return_window_days": days,
            "policy_source": "Company return policy",
            "retrieved_docs": len(docs)
        }
    
    def explain_rejection(
        self,
        product_category: str,
        days_since_purchase: int,
        reason: str
    ) -> str:
        """
        Generate customer-friendly explanation for rejection
        
        Args:
            product_category: Category of product
            days_since_purchase: Days since purchase
            reason: Reason for return
            
        Returns:
            Customer-friendly explanation
        """
        query = f"Why would a {product_category} return be rejected after {days_since_purchase} days?"
        
        docs = self.rag_service.retrieve_relevant_docs(query, top_k=2)
        
        context = "\n".join([doc['content'][:500] for doc in docs])
        
        system_prompt = "You are a customer support agent explaining return policy in a friendly, empathetic way."
        
        prompt = f"""A customer wants to return a {product_category} product after {days_since_purchase} days because: {reason}

Based on our policy:
{context}

Explain in a friendly, empathetic way why this return may not be eligible, and suggest alternatives if possible.
Keep it brief (2-3 sentences) and customer-focused."""
        
        result = self.llm_service.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=200
        )
        
        return result.get('text', 'Unfortunately, this return may not meet our policy requirements. Please contact support for assistance.')


# Global instance
_eligibility_service: Optional[RefundEligibilityService] = None


def get_eligibility_service() -> RefundEligibilityService:
    """Get or create global eligibility service instance"""
    global _eligibility_service
    if _eligibility_service is None:
        _eligibility_service = RefundEligibilityService()
    return _eligibility_service
