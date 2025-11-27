"""
Simple test for context loading function
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

print("Testing context loading...")

try:
    from app.database import SessionLocal
    from app.models.user import Customer
    from app.api.chat import _load_customer_context
    
    db = SessionLocal()
    
    # Find first customer
    customer = db.query(Customer).first()
    
    if customer:
        print(f"✓ Found customer ID: {customer.user_id}")
        
        # Test context loading
        context = _load_customer_context(customer.user_id, db)
        
        print(f"✓ Context loaded:")
        print(f"  - Has orders: {context['has_orders']}")
        print(f"  - Recent orders: {len(context['recent_orders'])}")
        print(f"  - Pending refunds: {len(context['pending_refunds'])}")
        print(f"  - Pending returns: {len(context['pending_returns'])}")
        
        print("\n✅ Context loading works!")
    else:
        print("⚠️  No customers found")
    
    db.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
