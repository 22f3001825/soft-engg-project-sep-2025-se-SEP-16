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
        
        # Gemini API configuration (primary)
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self.gemini_client = None
        
        # Initialize Gemini if API key is available
        if self.gemini_api_key and self.gemini_api_key != "GEMINI_API_KEY":
            self._initialize_gemini()
        else:
            logger.warning("Gemini API key not found. Using Ollama as primary LLM.")
        
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
        
    def generate(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 200
    ) -> Dict:
        """
        Generate text using Gemini API (primary) or Ollama (fallback)
        Returns dict with 'text', 'model', 'generation_time_ms', 'success'
        """
        start_time = time.time()
        
        # Try Gemini API first (fastest and most reliable)
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
        
        # Fallback to Ollama
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

llm_service = LLMService()
