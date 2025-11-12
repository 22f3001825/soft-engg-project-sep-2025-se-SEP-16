from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Float, Boolean, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base

class RefundStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PROCESSED = "PROCESSED"
    COMPLETED = "COMPLETED"

class ReturnStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PICKUP_SCHEDULED = "PICKUP_SCHEDULED"
    IN_TRANSIT = "IN_TRANSIT"
    RECEIVED = "RECEIVED"
    INSPECTED = "INSPECTED"
    COMPLETED = "COMPLETED"

class FraudRiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class RefundRequest(Base):
    __tablename__ = "refund_requests"

    id = Column(String, primary_key=True, default=str(func.gen_random_uuid()))
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.user_id"), nullable=False)
    amount = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    reason_category = Column(String(100), nullable=True)  # Defective, Wrong Item, Not as Described, etc.
    status = Column(Enum(RefundStatus), default=RefundStatus.REQUESTED)
    
    # AI Analysis
    ai_eligibility_check = Column(Boolean, nullable=True)
    ai_eligibility_reason = Column(Text, nullable=True)
    ai_fraud_score = Column(Float, nullable=True)
    ai_recommendation = Column(String(50), nullable=True)  # APPROVE, REJECT, REVIEW
    
    # Processing
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    processed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    processed_at = Column(DateTime, nullable=True)
    refund_method = Column(String(50), nullable=True)  # Original Payment, Store Credit, Bank Transfer
    transaction_id = Column(String(200), nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    order = relationship("Order")
    customer = relationship("Customer")

class ReturnRequest(Base):
    __tablename__ = "return_requests"

    id = Column(String, primary_key=True, default=str(func.gen_random_uuid()))
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.user_id"), nullable=False)
    refund_request_id = Column(String, ForeignKey("refund_requests.id"), nullable=True)
    
    reason = Column(Text, nullable=False)
    reason_category = Column(String(100), nullable=True)
    status = Column(Enum(ReturnStatus), default=ReturnStatus.REQUESTED)
    
    # Return Details
    items_to_return = Column(JSON, nullable=False)  # Array of {product_id, quantity, reason}
    return_shipping_label = Column(String(500), nullable=True)
    pickup_address = Column(JSON, nullable=True)
    pickup_date = Column(DateTime, nullable=True)
    tracking_number = Column(String(100), nullable=True)
    
    # Inspection
    received_at = Column(DateTime, nullable=True)
    inspected_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    inspected_at = Column(DateTime, nullable=True)
    inspection_notes = Column(Text, nullable=True)
    inspection_images = Column(JSON, nullable=True)  # Array of image URLs
    condition_rating = Column(Integer, nullable=True)  # 1-5
    
    # AI Analysis
    ai_fraud_check = Column(Boolean, nullable=True)
    ai_fraud_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    order = relationship("Order")
    customer = relationship("Customer")
    refund_request = relationship("RefundRequest")

class FraudCheck(Base):
    __tablename__ = "fraud_checks"

    id = Column(String, primary_key=True, default=str(func.gen_random_uuid()))
    refund_request_id = Column(String, ForeignKey("refund_requests.id"), nullable=True)
    return_request_id = Column(String, ForeignKey("return_requests.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.user_id"), nullable=False)
    
    # Fraud Indicators
    risk_level = Column(Enum(FraudRiskLevel), nullable=False)
    fraud_score = Column(Float, nullable=False)  # 0-100
    fraud_indicators = Column(JSON, nullable=True)  # Array of detected issues
    
    # Analysis Details
    customer_history_score = Column(Float, nullable=True)
    pattern_match_score = Column(Float, nullable=True)
    image_analysis_score = Column(Float, nullable=True)
    behavioral_score = Column(Float, nullable=True)
    
    # Decision
    flagged_for_review = Column(Boolean, default=False)
    auto_rejected = Column(Boolean, default=False)
    rejection_reason = Column(Text, nullable=True)
    
    # Review
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    review_decision = Column(String(50), nullable=True)  # APPROVE, REJECT, ESCALATE
    review_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    refund_request = relationship("RefundRequest")
    return_request = relationship("ReturnRequest")
    customer = relationship("Customer")

class ImageAnalysis(Base):
    __tablename__ = "image_analyses"

    id = Column(String, primary_key=True, default=str(func.gen_random_uuid()))
    return_request_id = Column(String, ForeignKey("return_requests.id"), nullable=False)
    image_url = Column(String(500), nullable=False)
    
    # AI Analysis Results
    analysis_status = Column(String(50), default="PENDING")  # PENDING, COMPLETED, FAILED
    product_detected = Column(Boolean, nullable=True)
    product_match_score = Column(Float, nullable=True)  # How well it matches original product
    condition_score = Column(Float, nullable=True)  # Product condition 0-100
    damage_detected = Column(Boolean, nullable=True)
    damage_type = Column(JSON, nullable=True)  # Array of damage types
    tampering_detected = Column(Boolean, nullable=True)
    authenticity_score = Column(Float, nullable=True)
    
    # Detailed Analysis
    ai_description = Column(Text, nullable=True)
    detected_objects = Column(JSON, nullable=True)
    quality_issues = Column(JSON, nullable=True)
    
    # Fraud Indicators
    fraud_indicators = Column(JSON, nullable=True)
    fraud_confidence = Column(Float, nullable=True)
    
    analyzed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    return_request = relationship("ReturnRequest")

class RejectionLog(Base):
    __tablename__ = "rejection_logs"

    id = Column(Integer, primary_key=True)
    refund_request_id = Column(String, ForeignKey("refund_requests.id"), nullable=True)
    return_request_id = Column(String, ForeignKey("return_requests.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.user_id"), nullable=False)
    
    rejection_type = Column(String(50), nullable=False)  # REFUND, RETURN
    rejection_reason = Column(Text, nullable=False)
    rejection_category = Column(String(100), nullable=True)  # Policy Violation, Fraud, Condition, etc.
    
    # Rejection Details
    rejected_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    rejected_by_system = Column(Boolean, default=False)
    fraud_related = Column(Boolean, default=False)
    fraud_score = Column(Float, nullable=True)
    
    # Customer Communication
    customer_notified = Column(Boolean, default=False)
    notification_sent_at = Column(DateTime, nullable=True)
    customer_response = Column(Text, nullable=True)
    
    # Appeal
    appeal_submitted = Column(Boolean, default=False)
    appeal_reason = Column(Text, nullable=True)
    appeal_status = Column(String(50), nullable=True)  # PENDING, APPROVED, REJECTED
    appeal_reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    appeal_reviewed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    refund_request = relationship("RefundRequest")
    return_request = relationship("ReturnRequest")
    customer = relationship("Customer")
