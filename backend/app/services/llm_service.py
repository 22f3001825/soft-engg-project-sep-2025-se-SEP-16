"""
LLM Service for AI Copilot
Handles all LLM inference for ticket summarization, response generation, and explanations
Uses Ollama for local LLM deployment (Llama 3.1 8B)
"""

import requests
import json
from typing import List, Dict, Optional
import time

class LLMService:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.model = "tinyllama"  # Using smallest model for low RAM
        self.timeout = 60
        
    def generate(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Dict:
        """
        Generate text using LLM
        Returns dict with 'text', 'model', 'generation_time_ms'
        """
        start_time = time.time()
        
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
                return {
                    "text": "",
                    "model": self.model,
                    "generation_time_ms": 0,
                    "success": False,
                    "error": f"HTTP {response.status_code}"
                }
                
        except requests.exceptions.ConnectionError:
            return {
                "text": "LLM service unavailable. Using fallback response.",
                "model": "fallback",
                "generation_time_ms": 0,
                "success": False,
                "error": "Connection failed - Ollama not running"
            }
        except Exception as e:
            return {
                "text": "",
                "model": self.model,
                "generation_time_ms": 0,
                "success": False,
                "error": str(e)
            }
    
    def check_health(self) -> bool:
        """Check if LLM service is available"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False

llm_service = LLMService()
