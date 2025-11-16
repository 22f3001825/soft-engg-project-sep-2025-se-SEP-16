"""
Knowledge Base Loader
Loads and indexes knowledge base documents for RAG
"""

import os
from pathlib import Path
from typing import List, Dict, Optional
import re

class KnowledgeLoader:
    def __init__(self, kb_path: str = "knowledge_base"):
        # Try multiple possible paths
        possible_paths = [
            Path(kb_path),
            Path("backend") / kb_path,
            Path(__file__).parent.parent.parent / kb_path
        ]
        
        self.kb_path = None
        for path in possible_paths:
            if path.exists():
                self.kb_path = path
                break
        
        if self.kb_path is None:
            self.kb_path = Path(kb_path)  # Use default even if doesn't exist
            
        self.documents = []
        
    def load_all_documents(self) -> List[Dict]:
        """Load all markdown and CSV documents from knowledge base"""
        documents = []
        
        if not self.kb_path.exists():
            return documents
        
        for doc_type in ["agent_docs", "supervisor_docs", "customer_docs"]:
            doc_dir = self.kb_path / doc_type
            if doc_dir.exists():
                # Load markdown files
                for file_path in doc_dir.glob("*.md"):
                    doc = self._load_document(file_path, doc_type)
                    if doc:
                        documents.append(doc)
                
                # Load CSV files (for customer FAQs)
                for file_path in doc_dir.glob("*.csv"):
                    csv_docs = self._load_csv_document(file_path, doc_type)
                    if csv_docs:
                        documents.extend(csv_docs)
        
        self.documents = documents
        return documents
    
    def _load_document(self, file_path: Path, doc_type: str) -> Optional[Dict]:
        """Load a single markdown document"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            title = self._extract_title(content, file_path.stem)
            category = self._categorize_document(file_path.stem, doc_type)
            
            return {
                "title": title,
                "content": content,
                "category": category,
                "subcategory": doc_type.replace("_docs", ""),
                "file_name": file_path.name,
                "file_path": str(file_path),
                "tags": self._extract_tags(file_path.stem),
                "keywords": self._extract_keywords(content)
            }
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
            return None
    
    def _load_csv_document(self, file_path: Path, doc_type: str) -> List[Dict]:
        """Load CSV document (FAQ format) and convert to individual documents"""
        try:
            import csv
            documents = []
            
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Each FAQ entry becomes a separate document
                    question = row.get('question', '')
                    answer = row.get('answer', '')
                    category = row.get('category', 'General')
                    keywords = row.get('keywords', '').split(',')
                    
                    content = f"Q: {question}\n\nA: {answer}"
                    
                    doc = {
                        "title": question,
                        "content": content,
                        "category": f"FAQ - {category}",
                        "subcategory": doc_type.replace("_docs", ""),
                        "file_name": file_path.name,
                        "file_path": str(file_path),
                        "tags": [k.strip() for k in keywords if k.strip()],
                        "keywords": [k.strip() for k in keywords if k.strip()]
                    }
                    documents.append(doc)
            
            return documents
        except Exception as e:
            print(f"Error loading CSV {file_path}: {e}")
            return []
    
    def _extract_title(self, content: str, fallback: str) -> str:
        """Extract title from markdown content"""
        lines = content.split('\n')
        for line in lines:
            if line.startswith('# '):
                return line.replace('# ', '').strip()
        return fallback.replace('_', ' ').title()
    
    def _categorize_document(self, filename: str, doc_type: str) -> str:
        """Categorize document based on filename"""
        # Customer-facing documents
        if doc_type == "customer_docs":
            if 'faq' in filename:
                return "Customer FAQ"
            elif 'policy' in filename:
                return "Customer Policy"
            elif 'guide' in filename:
                return "Customer Guide"
            else:
                return "Customer Information"
        
        # Agent/Supervisor documents
        if 'policy' in filename:
            return "Policy"
        elif 'sop' in filename:
            return "Standard Operating Procedure"
        elif 'template' in filename:
            return "Response Template"
        elif 'escalation' in filename:
            return "Escalation Rules"
        elif 'fraud' in filename:
            return "Fraud Detection"
        elif 'refund' in filename or 'return' in filename:
            return "Refund & Returns"
        elif 'evaluation' in filename:
            return "Performance Evaluation"
        elif 'sla' in filename:
            return "SLA Policy"
        else:
            return "General Guidelines"
    
    def _extract_tags(self, filename: str) -> List[str]:
        """Extract tags from filename"""
        tags = []
        parts = filename.split('_')
        
        for part in parts:
            if part not in ['policy', 'sop', 'template']:
                tags.append(part)
        
        return tags
    
    def _extract_keywords(self, content: str) -> List[str]:
        """Extract important keywords from content"""
        keywords = set()
        
        important_terms = [
            'refund', 'return', 'policy', 'escalate', 'fraud', 'approval',
            'reject', 'customer', 'agent', 'supervisor', 'ticket', 'order',
            'product', 'damage', 'defect', 'shipping', 'delivery', 'sla',
            'response time', 'resolution', 'complaint', 'dispute'
        ]
        
        content_lower = content.lower()
        for term in important_terms:
            if term in content_lower:
                keywords.add(term)
        
        return list(keywords)
    
    def get_documents_by_category(self, category: str) -> List[Dict]:
        """Get documents filtered by category"""
        return [doc for doc in self.documents if doc['category'] == category]
    
    def search_documents(self, query: str) -> List[Dict]:
        """Simple keyword search in documents"""
        query_lower = query.lower()
        results = []
        
        for doc in self.documents:
            score = 0
            if query_lower in doc['title'].lower():
                score += 3
            if query_lower in doc['content'].lower():
                score += 1
            if any(query_lower in tag.lower() for tag in doc['tags']):
                score += 2
            if any(query_lower in kw.lower() for kw in doc['keywords']):
                score += 2
            
            if score > 0:
                results.append({**doc, 'relevance_score': score})
        
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        return results

knowledge_loader = KnowledgeLoader()
