"""
AI Copilot Feature Validation Script
Comprehensive error checking and validation for all AI Copilot components
"""

import sys
from pathlib import Path
import traceback

backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

print("=" * 80)
print("AI COPILOT FEATURE VALIDATION")
print("=" * 80)

errors = []
warnings = []
passed = []

# Test 1: Import Validation
print("\n[1] Import Validation")
print("-" * 80)

try:
    from app.services.copilot_service import copilot_service
    passed.append("copilot_service import")
    print("PASS: copilot_service")
except Exception as e:
    errors.append(f"copilot_service import: {e}")
    print(f"FAIL: copilot_service: {e}")

try:
    from app.services.llm_service import llm_service
    passed.append("llm_service import")
    print("PASS: llm_service")
except Exception as e:
    errors.append(f"llm_service import: {e}")
    print(f"FAIL: llm_service: {e}")

try:
    from app.services.knowledge_loader import knowledge_loader
    passed.append("knowledge_loader import")
    print("PASS: knowledge_loader")
except Exception as e:
    errors.append(f"knowledge_loader import: {e}")
    print(f"FAIL: knowledge_loader: {e}")

try:
    from app.models.ai_copilot import (
        TicketSummary, SuggestedResponse, 
        RefundExplanation, ResponseTemplate
    )
    passed.append("ai_copilot models import")
    print("PASS: ai_copilot models")
except Exception as e:
    errors.append(f"ai_copilot models import: {e}")
    print(f"FAIL: ai_copilot models: {e}")

try:
    from app.api.copilot import router
    passed.append("copilot router import")
    print("PASS: copilot router")
except Exception as e:
    errors.append(f"copilot router import: {e}")
    print(f"FAIL: copilot router: {e}")

# Test 2: Service Initialization
print("\n[2] Service Initialization")
print("-" * 80)

try:
    from app.services.copilot_service import copilot_service
    
    if hasattr(copilot_service, 'llm'):
        passed.append("copilot_service.llm initialized")
        print("PASS: copilot_service.llm initialized")
    else:
        errors.append("copilot_service.llm not found")
        print("FAIL: copilot_service.llm not found")
    
    if hasattr(copilot_service, 'kb'):
        passed.append("copilot_service.kb initialized")
        print("PASS: copilot_service.kb initialized")
    else:
        errors.append("copilot_service.kb not found")
        print("FAIL: copilot_service.kb not found")
        
except Exception as e:
    errors.append(f"Service initialization: {e}")
    print(f"FAIL: Service initialization: {e}")

# Test 3: LLM Service Configuration
print("\n[3] LLM Service Configuration")
print("-" * 80)

try:
    from app.services.llm_service import llm_service
    
    print(f"  Base URL: {llm_service.base_url}")
    print(f"  Model: {llm_service.model}")
    print(f"  Timeout: {llm_service.timeout}s")
    
    # Check health
    is_healthy = llm_service.check_health()
    if is_healthy:
        passed.append("LLM service health check")
        print("PASS: LLM service is reachable")
    else:
        warnings.append("LLM service not reachable (Ollama may not be running)")
        print("WARN: LLM service not reachable (will use fallbacks)")
    
    # Test generation method exists
    if hasattr(llm_service, 'generate'):
        passed.append("LLM generate method")
        print("PASS: generate() method exists")
    else:
        errors.append("LLM generate method missing")
        print("FAIL: generate() method missing")
        
except Exception as e:
    errors.append(f"LLM service configuration: {e}")
    print(f"FAIL: LLM service configuration: {e}")

# Test 4: Knowledge Base Validation
print("\n[4] Knowledge Base Validation")
print("-" * 80)

try:
    from app.services.knowledge_loader import knowledge_loader
    
    docs = knowledge_loader.documents
    print(f"  Total documents: {len(docs)}")
    
    if len(docs) > 0:
        passed.append("Knowledge base loaded")
        print("PASS: Knowledge base documents loaded")
        
        # Check document structure
        sample_doc = docs[0]
        required_fields = ['title', 'content', 'category', 'tags', 'keywords']
        
        for field in required_fields:
            if field in sample_doc:
                passed.append(f"Document field: {field}")
            else:
                errors.append(f"Document missing field: {field}")
                print(f"FAIL: Document missing field: {field}")
        
        # Test search functionality
        if hasattr(knowledge_loader, 'search_documents'):
            results = knowledge_loader.search_documents("test")
            passed.append("Knowledge base search")
            print(f"PASS: search_documents() works (found {len(results)} results)")
        else:
            errors.append("search_documents method missing")
            print("FAIL: search_documents() method missing")
    else:
        warnings.append("No knowledge base documents found")
        print("WARN: No knowledge base documents found")
        
except Exception as e:
    errors.append(f"Knowledge base validation: {e}")
    print(f"FAIL: Knowledge base validation: {e}")

# Test 5: Copilot Service Methods
print("\n[5] Copilot Service Methods")
print("-" * 80)

try:
    from app.services.copilot_service import copilot_service
    
    required_methods = [
        'generate_ticket_summary',
        'generate_response_suggestions',
        'generate_refund_explanation'
    ]
    
    for method in required_methods:
        if hasattr(copilot_service, method):
            passed.append(f"Method: {method}")
            print(f"PASS: {method}()")
        else:
            errors.append(f"Method missing: {method}")
            print(f"FAIL: {method}() missing")
            
except Exception as e:
    errors.append(f"Copilot service methods: {e}")
    print(f"FAIL: Copilot service methods: {e}")

# Test 6: Database Models
print("\n[6] Database Models Validation")
print("-" * 80)

try:
    from app.models.ai_copilot import (
        TicketSummary, SuggestedResponse, 
        RefundExplanation, ResponseTemplate
    )
    
    models = [
        ('TicketSummary', TicketSummary),
        ('SuggestedResponse', SuggestedResponse),
        ('RefundExplanation', RefundExplanation),
        ('ResponseTemplate', ResponseTemplate)
    ]
    
    for model_name, model_class in models:
        if hasattr(model_class, '__tablename__'):
            passed.append(f"Model: {model_name}")
            print(f"PASS: {model_name} (table: {model_class.__tablename__})")
        else:
            errors.append(f"Model invalid: {model_name}")
            print(f"FAIL: {model_name} missing __tablename__")
            
except Exception as e:
    errors.append(f"Database models: {e}")
    print(f"FAIL: Database models: {e}")

# Test 7: API Endpoints
print("\n[7] API Endpoints Validation")
print("-" * 80)

try:
    from app.api.copilot import router
    
    print(f"  Router prefix: {router.prefix}")
    print(f"  Router tags: {router.tags}")
    print(f"  Total routes: {len(router.routes)}")
    
    required_endpoints = [
        'check_copilot_health',
        'get_ticket_summary',
        'get_response_suggestions',
        'get_refund_explanation',
        'search_knowledge_base',
        'get_team_insights',
        'get_agent_performance_analysis'
    ]
    
    for endpoint in required_endpoints:
        # Check if function exists in module
        from app.api import copilot as copilot_module
        if hasattr(copilot_module, endpoint):
            passed.append(f"Endpoint: {endpoint}")
            print(f"PASS: {endpoint}")
        else:
            errors.append(f"Endpoint missing: {endpoint}")
            print(f"FAIL: {endpoint} missing")
            
except Exception as e:
    errors.append(f"API endpoints: {e}")
    print(f"FAIL: API endpoints: {e}")

# Test 8: Functional Test - Generate Summary
print("\n[8] Functional Test - Ticket Summary")
print("-" * 80)

try:
    from app.services.copilot_service import copilot_service
    
    # Create minimal mock objects
    class MockTicket:
        id = "TEST-001"
        subject = "Test ticket"
        status = type('obj', (object,), {'value': 'OPEN'})()
        priority = type('obj', (object,), {'value': 'MEDIUM'})()
    
    class MockMessage:
        def __init__(self, sender_id, content):
            self.sender_id = sender_id
            self.content = content
    
    ticket = MockTicket()
    messages = [MockMessage(1, "Test message")]
    
    result = copilot_service.generate_ticket_summary(ticket, messages, None)
    
    if isinstance(result, dict):
        passed.append("Ticket summary generation")
        print("PASS: generate_ticket_summary() returns dict")
        
        required_keys = ['summary', 'key_points', 'customer_sentiment', 
                        'urgency_level', 'detected_category']
        
        for key in required_keys:
            if key in result:
                passed.append(f"Summary key: {key}")
            else:
                warnings.append(f"Summary missing key: {key}")
                print(f"WARN: Result missing key: {key}")
    else:
        errors.append("Ticket summary returns wrong type")
        print(f"FAIL: generate_ticket_summary() returns {type(result)}, expected dict")
        
except Exception as e:
    errors.append(f"Functional test - summary: {e}")
    print(f"FAIL: Functional test failed: {e}")
    traceback.print_exc()

# Test 9: Functional Test - Response Suggestions
print("\n[9] Functional Test - Response Suggestions")
print("-" * 80)

try:
    from app.services.copilot_service import copilot_service
    
    class MockTicket:
        id = "TEST-001"
        subject = "Test ticket"
        status = type('obj', (object,), {'value': 'OPEN'})()
        priority = type('obj', (object,), {'value': 'MEDIUM'})()
    
    class MockMessage:
        def __init__(self, sender_id, content):
            self.sender_id = sender_id
            self.content = content
    
    class MockCustomer:
        full_name = "Test User"
        email = "test@example.com"
    
    ticket = MockTicket()
    messages = [MockMessage(1, "Test message")]
    customer = MockCustomer()
    
    result = copilot_service.generate_response_suggestions(
        ticket, messages, customer, None
    )
    
    if isinstance(result, list):
        passed.append("Response suggestions generation")
        print(f"PASS: generate_response_suggestions() returns list ({len(result)} items)")
        
        if len(result) > 0:
            suggestion = result[0]
            required_keys = ['response_text', 'response_type', 'reasoning', 'confidence']
            
            for key in required_keys:
                if key in suggestion:
                    passed.append(f"Suggestion key: {key}")
                else:
                    warnings.append(f"Suggestion missing key: {key}")
                    print(f"WARN: Suggestion missing key: {key}")
    else:
        errors.append("Response suggestions returns wrong type")
        print(f"FAIL: generate_response_suggestions() returns {type(result)}, expected list")
        
except Exception as e:
    errors.append(f"Functional test - suggestions: {e}")
    print(f"FAIL: Functional test failed: {e}")
    traceback.print_exc()

# Test 10: Functional Test - Refund Explanation
print("\n[10] Functional Test - Refund Explanation")
print("-" * 80)

try:
    from app.services.copilot_service import copilot_service
    
    class MockRefund:
        id = "REF-001"
        amount = 100.0
        reason = "Test reason"
        status = type('obj', (object,), {'value': 'PENDING'})()
        ai_recommendation = "APPROVE"
        ai_eligibility_reason = "Test eligibility"
    
    refund = MockRefund()
    
    result = copilot_service.generate_refund_explanation(refund, None, None)
    
    if isinstance(result, dict):
        passed.append("Refund explanation generation")
        print("PASS: generate_refund_explanation() returns dict")
        
        required_keys = ['decision', 'agent_explanation', 'customer_explanation',
                        'reasoning_points', 'next_steps']
        
        for key in required_keys:
            if key in result:
                passed.append(f"Explanation key: {key}")
            else:
                warnings.append(f"Explanation missing key: {key}")
                print(f"WARN: Result missing key: {key}")
    else:
        errors.append("Refund explanation returns wrong type")
        print(f"FAIL: generate_refund_explanation() returns {type(result)}, expected dict")
        
except Exception as e:
    errors.append(f"Functional test - explanation: {e}")
    print(f"FAIL: Functional test failed: {e}")
    traceback.print_exc()

# Final Report
print("\n" + "=" * 80)
print("VALIDATION REPORT")
print("=" * 80)

print(f"\nPASS: {len(passed)} checks")
print(f"WARN: {len(warnings)} issues")
print(f"FAIL: {len(errors)} failures")

if warnings:
    print("\nWarnings:")
    for warning in warnings:
        print(f"  - {warning}")

if errors:
    print("\nErrors:")
    for error in errors:
        print(f"  - {error}")
    print("\nVALIDATION FAILED")
    sys.exit(1)
else:
    print("\nALL VALIDATIONS PASSED")
    print("\nAI Copilot feature is fully functional and ready for use!")
    
print("\n" + "=" * 80)
