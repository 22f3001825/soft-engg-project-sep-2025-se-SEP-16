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

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.model = "flan-t5-base"  # Good balance: 250M params, fast, quality responses
        self.timeout = 60
        self.hf_model = None
        self.hf_tokenizer = None
        self._initialize_hf_model()

    
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
        Generate text using Hugging Face Flan-T5 (fast and reliable)
        Returns dict with 'text', 'model', 'generation_time_ms'
        """
        start_time = time.time()
        
        # Try Hugging Face model first (faster and more reliable)
        if self.hf_model and self.hf_tokenizer:
            try:
                # Format prompt for TinyLlama chat format
                if system_prompt:
                    chat_prompt = f"<|system|>\n{system_prompt}</s>\n<|user|>\n{prompt}</s>\n<|assistant|>\n"
                else:
                    chat_prompt = f"<|user|>\n{prompt}</s>\n<|assistant|>\n"
                
                # Tokenize and generate
                inputs = self.hf_tokenizer(chat_prompt, return_tensors="pt", max_length=1024, truncation=True)
                inputs = inputs.to(self.device)
                
                outputs = self.hf_model.generate(
                    **inputs,
                    max_new_tokens=max_tokens,
                    temperature=temperature,
                    do_sample=True,
                    top_p=0.9,
                    top_k=50,
                    repetition_penalty=1.1,
                    pad_token_id=self.hf_tokenizer.eos_token_id
                )
                
                # Decode only the new tokens (not the input prompt)
                generated_text = self.hf_tokenizer.decode(outputs[0][inputs['input_ids'].shape[1]:], skip_special_tokens=True)
                generation_time = int((time.time() - start_time) * 1000)
                
                logger.info(f"Generated response in {generation_time}ms using TinyLlama")
                
                return {
                    "text": generated_text.strip(),
                    "model": "tinyllama-1.1b",
                    "generation_time_ms": generation_time,
                    "success": True
                }
                
            except Exception as e:
                logger.error(f"Hugging Face generation failed: {e}")
                # Fall through to Ollama fallback
        
        # Fallback to Ollama if HF fails
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
        # Check Hugging Face model first
        if self.hf_model is not None:
            return True
        
        # Fallback to Ollama check
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False

llm_service = LLMService()
