"""
LLM Service for AI Copilot
Handles all LLM inference for ticket summarization, response generation, and explanations
Uses Hugging Face Transformers with Flan-T5 (fast, lightweight, CPU-friendly)
"""

import requests
import json
from typing import List, Dict, Optional
import time
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self, base_url: str = "http://localhost:11434"):
        # Ollama configuration (fallback)
        self.base_url = base_url
        self.model = os.getenv("OLLAMA_MODEL", "gemma2:2b")
        self.timeout = 60
        
        # Grok API configuration (primary - fastest!)
        self.grok_api_key = os.getenv("GROK_API_KEY")
        self.grok_model = os.getenv("GROK_MODEL", "llama-3.1-8b-instant")
        self.grok_base_url = "https://api.groq.com/openai/v1"
        
        # Initialize Grok if API key is available
        if self.grok_api_key and self.grok_api_key not in ["your_api_key_here", "GROK_API_KEY"]:
            logger.info(f"Grok API initialized with model: {self.grok_model}")
        else:
            logger.warning("Grok API key not found. Will use Gemini as primary.")
        
        # Gemini API configuration (secondary fallback)
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self.gemini_client = None
        
        # Initialize Gemini if API key is available
        if self.gemini_api_key and self.gemini_api_key != "GEMINI_API_KEY":
            self._initialize_gemini()
        else:
            logger.warning("Gemini API key not found. Will use Ollama as fallback.")
        
        # Hugging Face models (disabled for now)
        self.hf_model = None
        self.hf_tokenizer = None    
        # self._initialize_hf_model()

    def _initialize_gemini(self):
        """Initialize Google Gemini API"""
        try:
            import google.generativeai as genai
            
            logger.info(f"Initializing Gemini API with model: {self.gemini_model}")
            genai.configure(api_key=self.gemini_api_key)
            
            # Create the model with configuration
            generation_config = {
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 64,
                "max_output_tokens": 8192,
            }
            
            self.gemini_client = genai.GenerativeModel(
                model_name=self.gemini_model,
                generation_config=generation_config
            )
            
            logger.info("Gemini API initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Gemini API: {e}")
            self.gemini_client = None
    
    def _initialize_hf_model(self):
        """Initialize Hugging Face model (Flan-T5-base)"""
        try:
            from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
            import torch
            
            logger.info("Loading Flan-T5-base model from Hugging Face...")
            self.hf_tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-base")
            self.hf_model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-base")
            
            # Use CPU
            self.device = "cpu"
            self.hf_model = self.hf_model.to(self.device)
            logger.info("Flan-T5-base model loaded successfully on CPU")
            
        except Exception as e:
            logger.error(f"Failed to load Hugging Face model: {e}")
            self.hf_model = None
            self.hf_tokenizer = None
        
    def check_health(self) -> bool:
        """Check if LLM service is available"""
        # Check Grok API first (primary)
        if self.grok_api_key:
            return True
            
        # Check Gemini API second
        if self.gemini_client is not None:
            return True
        
        # Check Hugging Face model
        if self.hf_model is not None:
            return True
        
        # Fallback to Ollama check
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False

    def generate(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 200
    ) -> Dict:
        """
        Generate text using Grok (primary), Gemini (secondary), or Ollama (fallback)
        Returns dict with 'text', 'model', 'generation_time_ms', 'success'
        """
        start_time = time.time()
        
        # Tier 1: Try Grok API (Fastest & Most Accurate)
        if self.grok_api_key:
            try:
                messages = []
                if system_prompt:
                    messages.append({"role": "system", "content": system_prompt})
                messages.append({"role": "user", "content": prompt})
                
                payload = {
                    "messages": messages,
                    "model": self.grok_model,
                    "stream": False,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                }
                
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.grok_api_key}"
                }
                
                response = requests.post(
                    f"{self.grok_base_url}/chat/completions",
                    json=payload,
                    headers=headers,
                    timeout=10  # Fast timeout for Grok
                )
                
                if response.status_code == 200:
                    result = response.json()
                    generation_time = int((time.time() - start_time) * 1000)
                    text = result['choices'][0]['message']['content']
                    
                    logger.info(f"Generated response in {generation_time}ms using Grok {self.grok_model}")
                    
                    return {
                        "text": text,
                        "model": self.grok_model,
                        "generation_time_ms": generation_time,
                        "success": True
                    }
                else:
                    logger.warning(f"Grok API error: {response.status_code} - {response.text}")
                    # Fall through to Gemini
                    
            except Exception as e:
                logger.error(f"Grok API generation failed: {e}")
                # Fall through to Gemini

        # Tier 2: Try Gemini API (Reliable Fallback)
        if self.gemini_client:
            try:
                # Combine system prompt and user prompt
                if system_prompt:
                    full_prompt = f"{system_prompt}\n\n{prompt}"
                else:
                    full_prompt = prompt
                
                # Generate with Gemini
                response = self.gemini_client.generate_content(
                    full_prompt,
                    generation_config={
                        "temperature": temperature,
                        "max_output_tokens": max_tokens,
                    }
                )
                
                generation_time = int((time.time() - start_time) * 1000)
                
                # Check if response was blocked by safety filters
                if not response.parts:
                    logger.warning(f"Gemini response blocked by safety filters (finish_reason: {response.candidates[0].finish_reason})")
                    # Return a safe fallback response instead of crashing
                    return {
                        "text": "I apologize, but I'm having trouble generating a response. Please rephrase your question or contact our support team.",
                        "model": self.gemini_model,
                        "generation_time_ms": generation_time,
                        "success": False
                    }
                
                logger.info(f"Generated response in {generation_time}ms using Gemini {self.gemini_model}")
                
                return {
                    "text": response.text.strip(),
                    "model": self.gemini_model,
                    "generation_time_ms": generation_time,
                    "success": True
                }
                
            except Exception as e:
                logger.error(f"Gemini API generation failed: {e}")
                logger.info("Falling back to Ollama...")
                # Fall through to Ollama fallback
        
        # Tier 3: Fallback to Ollama (Local)
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            payload = {
                "model": self.model,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                generation_time = int((time.time() - start_time) * 1000)
                
                logger.info(f"Generated response in {generation_time}ms using Ollama {self.model}")
                
                return {
                    "text": result.get("message", {}).get("content", ""),
                    "model": self.model,
                    "generation_time_ms": generation_time,
                    "success": True
                }
            else:
                return self._fallback_response()
                
        except Exception as e:
            logger.error(f"Ollama generation failed: {e}")
            return self._fallback_response()
    
    def _fallback_response(self):
        """Return a helpful fallback response"""
        return {
            "text": "I apologize, but I'm having trouble generating a response right now. Please try rephrasing your question or contact our support team for immediate assistance.",
            "model": "fallback",
            "generation_time_ms": 0,
            "success": False,
            "error": "LLM unavailable"
        }
    
    def check_health(self) -> bool:
        """Check if LLM service is available"""
        # Check Gemini API first
        if self.gemini_client is not None:
            return True
        
        # Check Hugging Face model
        if self.hf_model is not None:
            return True
        
        # Fallback to Ollama check
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def _rule_based_priority_fallback(self, message: str, category: str) -> str:
        """
        Rule-based priority classification fallback
        Used when Gemini API fails
        """
        message_lower = message.lower()
        
        # High priority keywords
        high_keywords = [
            "urgent", "asap", "immediately", "emergency", "critical",
            "charged twice", "wrong amount", "unauthorized", "payment failed",
            "not received", "missing", "damaged", "broken", "defective",
            "locked out", "can't login", "can't access", "hacked"
        ]
        
        # Low priority keywords
        low_keywords = [
            "question", "wondering", "curious", "when possible",
            "feedback", "suggestion", "thank you", "policy"
        ]
        
        # Check high priority
        if any(keyword in message_lower for keyword in high_keywords):
            return "high"
        
        # Check low priority
        if any(keyword in message_lower for keyword in low_keywords):
            return "low"
        
        # Check category-based priority
        if category in ["Account & Security", "Payment Issues"]:
            return "high"
        elif category in ["General Inquiry", "Product Question"]:
            return "low"
        
        # Default to medium
        return "medium"
    
    def classify_ticket_priority(
        self,
        ticket_message: str,
        subject: str = "",
        category: str = "General",
        customer_data: Optional[Dict] = None
    ) -> Dict[str, any]:
        """
        Classify ticket priority using Gemini API with comprehensive edge case handling
        
        Args:
            ticket_message: Ticket description/message
            subject: Ticket subject (optional)
            category: Ticket category
            customer_data: Customer info (tier, total_orders, recent_tickets)
            
        Returns:
            {
                "priority": "high" | "medium" | "low",
                "confidence": 0.0-1.0,
                "reason": "explanation",
                "method": "gemini" | "rule_based" | "default"
            }
        """
        start_time = time.time()
        
        # Edge Case 1: Empty or very short message
        if not ticket_message or len(ticket_message.strip()) < 3:
            logger.warning("Empty or very short ticket message, defaulting to medium priority")
            return {
                "priority": "medium",
                "confidence": 0.5,
                "reason": "Empty or very short message",
                "method": "default"
            }
        
        # Edge Case 2: Very long message - truncate
        MAX_MESSAGE_LENGTH = 1000
        original_length = len(ticket_message)
        if len(ticket_message) > MAX_MESSAGE_LENGTH:
            # Keep first 700 chars and last 300 chars
            ticket_message = ticket_message[:700] + "...[truncated]..." + ticket_message[-300:]
            logger.info(f"Truncated long ticket message from {original_length} to {len(ticket_message)} chars")
        
        # Prepare customer context
        customer_tier = "regular"
        total_orders = 0
        recent_tickets = 0
        
        if customer_data:
            customer_tier = customer_data.get("tier", "regular")
            total_orders = customer_data.get("total_orders", 0)
            recent_tickets = customer_data.get("recent_tickets", 0)
        
        # Try Gemini API first
        if self.gemini_client:
            try:
                prompt = f"""You are an e-commerce customer support priority classifier.

Analyze this support ticket and assign priority: HIGH, MEDIUM, or LOW.

TICKET DETAILS:
Subject: {subject}
Message: {ticket_message}
Category: {category}
Customer Tier: {customer_tier}
Recent Tickets (30 days): {recent_tickets}
Total Orders: {total_orders}

E-COMMERCE PRIORITY RULES:

HIGH PRIORITY (urgent, requires immediate attention):
- Payment issues (charged twice, wrong amount, payment failed, unauthorized charge)
- Order not received or missing items
- Account locked/hacked or can't access account
- Damaged/defective/broken products
- Time-sensitive requests (event, gift, deadline, "need by")
- VIP customers with issues
- Very angry/frustrated customers

MEDIUM PRIORITY (important, needs attention soon):
- Shipping delays or tracking issues
- Return/refund requests
- Product defects (non-urgent)
- General order questions
- Account issues (non-urgent)
- Exchange/replacement requests

LOW PRIORITY (can wait, informational):
- General product questions
- Policy inquiries (return policy, shipping policy)
- Feature requests or suggestions
- Positive feedback or thank you messages
- Non-urgent questions

EXAMPLES:
1. "I was charged twice for order #1234!" → HIGH (payment issue)
2. "Where is my order? It's been 2 weeks" → MEDIUM (shipping delay)
3. "What's your return policy?" → LOW (general inquiry)
4. "My package arrived damaged!" → HIGH (damaged product)
5. "Can I change my shipping address?" → MEDIUM (order modification)
6. "URGENT! Need this by tomorrow for a wedding!" → HIGH (time-sensitive)
7. "Thank you for the great service!" → LOW (positive feedback)

Respond with ONLY a JSON object:
{{"priority": "high/medium/low", "confidence": 0.0-1.0, "reason": "brief explanation"}}"""

                result = self.generate(
                    prompt=prompt,
                    system_prompt="You are a helpful e-commerce support priority classifier.",
                    temperature=0.2,  # Low for consistent classification
                    max_tokens=150
                )
                
                if result['success']:
                    try:
                        import json
                        # Try to parse JSON from response
                        response_text = result['text'].strip()
                        
                        # Handle case where response might have extra text
                        if '{' in response_text and '}' in response_text:
                            json_start = response_text.index('{')
                            json_end = response_text.rindex('}') + 1
                            json_str = response_text[json_start:json_end]
                            classification = json.loads(json_str)
                        else:
                            classification = json.loads(response_text)
                        
                        priority = classification.get("priority", "medium").lower()
                        confidence = float(classification.get("confidence", 0.7))
                        reason = classification.get("reason", "Classified by Gemini")
                        
                        # Validate priority value
                        if priority not in ["high", "medium", "low"]:
                            priority = "medium"
                            confidence = 0.5
                        
                        # Edge Case 7: VIP customer boost
                        if customer_tier == "vip" or total_orders > 1000:
                            if priority == "low":
                                priority = "medium"
                                reason += " (boosted for VIP customer)"
                            elif priority == "medium":
                                priority = "high"
                                reason += " (boosted for VIP customer)"
                        
                        # Edge Case 9: Low confidence - default to medium
                        if confidence < 0.6:
                            logger.warning(f"Low confidence ({confidence}) in classification, defaulting to medium")
                            priority = "medium"
                            reason += " (low confidence, defaulted to medium)"
                        
                        classification_time = int((time.time() - start_time) * 1000)
                        logger.info(f"Ticket classified as {priority} (confidence: {confidence:.2f}, time: {classification_time}ms, method: gemini)")
                        
                        return {
                            "priority": priority,
                            "confidence": confidence,
                            "reason": reason,
                            "method": "gemini"
                        }
                        
                    except (json.JSONDecodeError, ValueError, KeyError) as e:
                        logger.error(f"Failed to parse Gemini classification response: {e}")
                        logger.debug(f"Response text: {result['text']}")
                        # Fall through to rule-based fallback
                
            except Exception as e:
                logger.error(f"Gemini priority classification failed: {e}")
                # Fall through to rule-based fallback
        
        # Fallback to rule-based classification
        logger.info("Using rule-based priority classification fallback")
        priority = self._rule_based_priority_fallback(ticket_message, category)
        
        # VIP boost for rule-based as well
        if customer_tier == "vip" or total_orders > 1000:
            if priority == "low":
                priority = "medium"
            elif priority == "medium":
                priority = "high"
        
        classification_time = int((time.time() - start_time) * 1000)
        logger.info(f"Ticket classified as {priority} (time: {classification_time}ms, method: rule_based)")
        
        return {
            "priority": priority,
            "confidence": 0.7,
            "reason": "Classified using rule-based fallback",
            "method": "rule_based"
        }

llm_service = LLMService()
