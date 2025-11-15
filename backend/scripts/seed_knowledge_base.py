"""
Script to seed knowledge base with sample articles
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.knowledge_base import KnowledgeBase
from datetime import datetime


def seed_knowledge_base():
    """Seed knowledge base with sample articles"""
    db = SessionLocal()
    
    articles = [
        {
            "title": "Refund Policy",
            "content": """Our refund policy allows customers to request refunds within 30 days of purchase. 
            To be eligible for a refund:
            - The product must be unused and in original packaging
            - You must provide proof of purchase
            - The product must not be damaged by the customer
            - Refunds are processed within 5-7 business days
            - Original shipping costs are non-refundable
            
            For damaged or defective products, we offer full refunds including shipping costs.""",
            "category": "refund",
            "tags": "refund,policy,return,money-back"
        },
        {
            "title": "Return Process",
            "content": """To return a product:
            1. Log into your account and go to Order History
            2. Select the order you want to return
            3. Click 'Request Return' and select the reason
            4. Upload photos of the product if damaged
            5. Print the return shipping label
            6. Pack the item securely and ship it back
            
            Once we receive your return, we'll inspect it and process your refund within 3-5 business days.""",
            "category": "return",
            "tags": "return,process,shipping,how-to"
        },
        {
            "title": "Shipping Times",
            "content": """Standard shipping times:
            - Domestic orders: 3-5 business days
            - Express shipping: 1-2 business days
            - International orders: 7-14 business days
            
            Orders are processed within 24 hours on business days. You'll receive a tracking number once your order ships.
            
            Note: Shipping times may be longer during holidays or peak seasons.""",
            "category": "shipping",
            "tags": "shipping,delivery,tracking,timeline"
        },
        {
            "title": "Order Tracking",
            "content": """To track your order:
            1. Log into your account
            2. Go to 'My Orders'
            3. Click on the order you want to track
            4. View real-time tracking information
            
            You can also track your order using the tracking number sent to your email. 
            If tracking hasn't updated in 48 hours, please contact support.""",
            "category": "orders",
            "tags": "tracking,orders,status,delivery"
        },
        {
            "title": "Payment Methods",
            "content": """We accept the following payment methods:
            - Credit cards (Visa, MasterCard, American Express)
            - Debit cards
            - PayPal
            - Apple Pay
            - Google Pay
            
            All payments are processed securely through encrypted connections. 
            We never store your full credit card information.""",
            "category": "payment",
            "tags": "payment,credit-card,paypal,security"
        },
        {
            "title": "Account Security",
            "content": """To keep your account secure:
            - Use a strong, unique password
            - Enable two-factor authentication
            - Never share your password
            - Log out on shared devices
            - Review your account activity regularly
            
            If you suspect unauthorized access, change your password immediately and contact support.""",
            "category": "account",
            "tags": "security,password,account,safety"
        },
        {
            "title": "Product Warranty",
            "content": """Most products come with a manufacturer's warranty:
            - Electronics: 1-year warranty
            - Appliances: 2-year warranty
            - Clothing: 90-day warranty
            
            Warranty covers manufacturing defects but not:
            - Normal wear and tear
            - Accidental damage
            - Misuse or abuse
            
            To claim warranty, contact us with your order number and description of the issue.""",
            "category": "warranty",
            "tags": "warranty,guarantee,defect,coverage"
        },
        {
            "title": "Damaged Items",
            "content": """If you receive a damaged item:
            1. Take photos of the damage and packaging
            2. Contact support within 48 hours
            3. Provide your order number and photos
            4. We'll arrange a replacement or full refund
            
            For shipping damage, keep all packaging materials for inspection. 
            We'll cover all return shipping costs for damaged items.""",
            "category": "damage",
            "tags": "damage,broken,defective,replacement"
        },
        {
            "title": "Canceling Orders",
            "content": """You can cancel your order:
            - Within 2 hours of placing it: Full refund, no questions asked
            - Before shipping: Full refund minus processing fee
            - After shipping: Must follow return process
            
            To cancel, go to your order history and click 'Cancel Order'. 
            If the option isn't available, contact support immediately.""",
            "category": "orders",
            "tags": "cancel,cancellation,order,refund"
        },
        {
            "title": "Gift Cards and Promotions",
            "content": """Gift card information:
            - Gift cards never expire
            - Can be used for any product
            - Cannot be redeemed for cash
            - Check balance in your account
            
            Promotional codes:
            - Enter at checkout
            - Cannot be combined with other offers
            - Check expiration dates
            - One per order unless stated otherwise""",
            "category": "promotions",
            "tags": "gift-card,promo,discount,coupon"
        },
        {
            "title": "International Shipping",
            "content": """We ship to over 100 countries worldwide.
            
            Important notes:
            - Customs fees and import taxes are customer's responsibility
            - Delivery times vary by country (7-21 business days)
            - Some products may have shipping restrictions
            - International orders cannot be expedited
            
            Track your international shipment using the provided tracking number.""",
            "category": "shipping",
            "tags": "international,worldwide,customs,global"
        },
        {
            "title": "Size and Fit Guide",
            "content": """Finding the right size:
            - Check our size charts on each product page
            - Measurements are in inches and centimeters
            - Read customer reviews for fit feedback
            - Contact support if unsure
            
            If an item doesn't fit:
            - Free exchanges within 30 days
            - Return for refund or different size
            - Keep tags attached for exchanges""",
            "category": "products",
            "tags": "size,fit,clothing,exchange"
        }
    ]
    
    try:
        # Check if articles already exist
        existing_count = db.query(KnowledgeBase).count()
        if existing_count > 0:
            print(f"Knowledge base already has {existing_count} articles")
            response = input("Do you want to add more articles? (y/n): ")
            if response.lower() != 'y':
                print("Seeding cancelled")
                return
        
        # Add articles
        added = 0
        for article_data in articles:
            article = KnowledgeBase(
                title=article_data["title"],
                content=article_data["content"],
                category=article_data["category"],
                tags=article_data["tags"],
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(article)
            added += 1
        
        db.commit()
        print(f"Successfully added {added} knowledge base articles")
        print("\nNext steps:")
        print("1. Start the FastAPI server")
        print("2. Call POST /api/v1/chat/index-knowledge-base to generate embeddings")
        print("3. Test the chatbot with customer queries")
        
    except Exception as e:
        print(f"Error seeding knowledge base: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_knowledge_base()
