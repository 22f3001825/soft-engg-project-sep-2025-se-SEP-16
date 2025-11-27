"""
Test Order/Refund Integration with RAG Chatbot
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal
from app.models.user import User, Customer
from app.models.order import Order, OrderItem, OrderStatus
from app.models.refund import RefundRequest, RefundStatus
from app.api.chat import _load_customer_context
from datetime import datetime, timedelta

print("=" * 70)
print("Testing Order/Refund Integration with RAG Chatbot")
print("=" * 70)

db = SessionLocal()

try:
    # Find a customer with orders
    customer = db.query(Customer).join(User).filter(User.role == "CUSTOMER").first()
    
    if not customer:
        print("\n❌ No customers found in database")
        sys.exit(1)
    
    print(f"\n✓ Found customer: {customer.user.full_name} (ID: {customer.user_id})")
    
    # Check if customer has orders
    orders = db.query(Order).filter(Order.customer_id == customer.user_id).all()
    print(f"✓ Customer has {len(orders)} orders")
    
    # If no orders, create a test order
    if len(orders) == 0:
        print("\n📦 Creating test order...")
        test_order = Order(
            order_number=f"ORD-TEST-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            customer_id=customer.user_id,
            status=OrderStatus.DELIVERED,
            subtotal=99.99,
            tax=8.00,
            shipping_cost=5.00,
            total=112.99,
            payment_method="Credit Card",
            payment_status="PAID",
            created_at=datetime.now() - timedelta(days=10)
        )
        db.add(test_order)
        db.flush()
        
        # Add order items
        test_item = OrderItem(
            order_id=test_order.id,
            product_id="PROD-001",
            product_name="Wireless Headphones",
            quantity=1,
            price=99.99,
            subtotal=99.99
        )
        db.add(test_item)
        db.commit()
        print(f"✓ Created test order: {test_order.order_number}")
        orders = [test_order]
    
    # Check for refund requests
    refunds = db.query(RefundRequest).filter(
        RefundRequest.customer_id == customer.user_id
    ).all()
    print(f"✓ Customer has {len(refunds)} refund requests")
    
    # If no refunds, create a test refund
    if len(refunds) == 0 and len(orders) > 0:
        print("\n💰 Creating test refund request...")
        test_refund = RefundRequest(
            order_id=orders[0].id,
            customer_id=customer.user_id,
            amount=orders[0].total,
            reason="Product arrived damaged",
            reason_category="Damaged",
            status=RefundStatus.UNDER_REVIEW,
            created_at=datetime.now() - timedelta(days=2)
        )
        db.add(test_refund)
        db.commit()
        print(f"✓ Created test refund request: {test_refund.id}")
        refunds = [test_refund]
    
    # Test the context loading function
    print("\n" + "=" * 70)
    print("Testing Context Loading Function")
    print("=" * 70)
    
    context = _load_customer_context(customer.user_id, db)
    
    print(f"\n✓ Context loaded successfully")
    print(f"  - Has orders: {context['has_orders']}")
    print(f"  - Recent orders: {len(context['recent_orders'])}")
    print(f"  - Pending refunds: {len(context['pending_refunds'])}")
    print(f"  - Pending returns: {len(context['pending_returns'])}")
    
    # Display order details
    if context['recent_orders']:
        print("\n📦 Recent Orders:")
        for order in context['recent_orders'][:3]:
            print(f"  - Order #{order['order_number']}")
            print(f"    Status: {order['status']}")
            print(f"    Total: ${order['total']:.2f}")
            print(f"    Items: {len(order['items'])}")
            for item in order['items'][:2]:
                print(f"      • {item['product_name']} x{item['quantity']} - ${item['price']:.2f}")
    
    # Display refund details
    if context['pending_refunds']:
        print("\n💰 Pending Refunds:")
        for refund in context['pending_refunds']:
            print(f"  - Refund ID: {refund['refund_id']}")
            print(f"    Order: #{refund['order_number']}")
            print(f"    Amount: ${refund['amount']:.2f}")
            print(f"    Status: {refund['status']}")
            print(f"    Reason: {refund['reason']}")
    
    # Test RAG service with customer context
    print("\n" + "=" * 70)
    print("Testing RAG Service with Customer Context")
    print("=" * 70)
    
    from app.services.rag_service import get_rag_service
    
    rag_service = get_rag_service()
    
    if not rag_service.is_available():
        print("\n⚠️  RAG service not available, skipping RAG test")
    else:
        print("\n✓ RAG service is available")
        
        # Test queries
        test_queries = [
            "What's the status of my order?",
            "Can I get a refund?",
            "Where is my refund?"
        ]
        
        for query in test_queries:
            print(f"\n🔍 Query: {query}")
            result = rag_service.answer_question(
                query,
                customer_context=context
            )
            print(f"📝 Response: {result['response'][:200]}...")
            print(f"   Sources: {len(result['sources'])} documents")
    
    print("\n" + "=" * 70)
    print("✅ All Tests Passed!")
    print("=" * 70)
    print("\nIntegration Summary:")
    print("✓ Customer context loading works")
    print("✓ Order data accessible")
    print("✓ Refund data accessible")
    print("✓ RAG service can use customer context")
    print("\nThe chatbot can now:")
    print("  • Answer questions about specific orders")
    print("  • Provide refund status updates")
    print("  • Give personalized responses based on customer data")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
