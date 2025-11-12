from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class InsightLog(Base):
    __tablename__ = "insight_logs"

    id = Column(Integer, primary_key=True)
    
    # Insight Details
    insight_type = Column(String(100), nullable=False)  # TREND, ANOMALY, PREDICTION, RECOMMENDATION
    category = Column(String(100), nullable=False)  # TICKET, REFUND, PRODUCT, AGENT, CUSTOMER
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    
    # Insight Data
    severity = Column(String(20), nullable=True)  # LOW, MEDIUM, HIGH, CRITICAL
    confidence_score = Column(Float, nullable=False)
    impact_score = Column(Float, nullable=True)  # Estimated business impact
    
    # Supporting Data
    data_points = Column(JSON, nullable=True)  # Raw data used for insight
    metrics = Column(JSON, nullable=True)  # Key metrics
    visualization_data = Column(JSON, nullable=True)  # Data for charts
    
    # Recommendations
    recommended_actions = Column(JSON, nullable=True)  # Array of suggested actions
    estimated_benefit = Column(Text, nullable=True)
    
    # Source
    source_tickets = Column(JSON, nullable=True)  # Ticket IDs analyzed
    source_refunds = Column(JSON, nullable=True)  # Refund IDs analyzed
    source_products = Column(JSON, nullable=True)  # Product IDs analyzed
    analysis_period_start = Column(DateTime, nullable=True)
    analysis_period_end = Column(DateTime, nullable=True)
    
    # AI Model
    model_used = Column(String(100), nullable=True)
    model_version = Column(String(50), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_actionable = Column(Boolean, default=True)
    
    # Review
    reviewed = Column(Boolean, default=False)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    review_notes = Column(Text, nullable=True)
    
    # Action Taken
    action_taken = Column(Boolean, default=False)
    action_description = Column(Text, nullable=True)
    action_taken_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    action_taken_at = Column(DateTime, nullable=True)
    action_result = Column(Text, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime, nullable=True)  # When insight becomes stale

    # Relationships
    reviewed_by_user = relationship("User", foreign_keys=[reviewed_by])
    action_taken_by_user = relationship("User", foreign_keys=[action_taken_by])

class AutoLearnedPattern(Base):
    __tablename__ = "auto_learned_patterns"

    id = Column(Integer, primary_key=True)
    
    # Pattern Details
    pattern_type = Column(String(100), nullable=False)  # COMMON_ISSUE, RESOLUTION_PATH, CUSTOMER_BEHAVIOR
    pattern_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    
    # Pattern Data
    pattern_signature = Column(JSON, nullable=False)  # Key characteristics
    occurrence_count = Column(Integer, default=1)
    success_rate = Column(Float, nullable=True)
    
    # Context
    category = Column(String(100), nullable=True)
    subcategory = Column(String(100), nullable=True)
    related_products = Column(JSON, nullable=True)
    related_issues = Column(JSON, nullable=True)
    
    # Learning Source
    learned_from_tickets = Column(JSON, nullable=True)  # Ticket IDs
    learned_from_refunds = Column(JSON, nullable=True)  # Refund IDs
    first_seen_at = Column(DateTime, nullable=False)
    last_seen_at = Column(DateTime, nullable=False)
    
    # Application
    applied_to_kb = Column(Boolean, default=False)
    kb_article_id = Column(Integer, ForeignKey("knowledge_base.id"), nullable=True)
    applied_to_faq = Column(Boolean, default=False)
    faq_item_id = Column(Integer, ForeignKey("faq_items.id"), nullable=True)
    
    # Validation
    confidence_score = Column(Float, nullable=False)
    validated = Column(Boolean, default=False)
    validated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    validated_at = Column(DateTime, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    kb_article = relationship("KnowledgeBase")
    faq_item = relationship("FAQItem")
    validated_by_user = relationship("User")

class PredictiveInsight(Base):
    __tablename__ = "predictive_insights"

    id = Column(Integer, primary_key=True)
    
    # Prediction Details
    prediction_type = Column(String(100), nullable=False)  # TICKET_VOLUME, REFUND_SPIKE, PRODUCT_ISSUE, AGENT_BURNOUT
    target_entity_type = Column(String(50), nullable=True)  # PRODUCT, AGENT, CUSTOMER, SYSTEM
    target_entity_id = Column(String(200), nullable=True)
    
    # Prediction
    prediction = Column(Text, nullable=False)
    predicted_value = Column(Float, nullable=True)
    predicted_range_min = Column(Float, nullable=True)
    predicted_range_max = Column(Float, nullable=True)
    
    # Timeframe
    prediction_date = Column(DateTime, nullable=False)  # When prediction is for
    prediction_horizon_days = Column(Integer, nullable=False)  # How far ahead
    
    # Confidence
    confidence_score = Column(Float, nullable=False)
    confidence_interval = Column(Float, nullable=True)
    
    # Impact
    potential_impact = Column(Text, nullable=True)
    impact_severity = Column(String(20), nullable=True)  # LOW, MEDIUM, HIGH, CRITICAL
    
    # Recommendations
    preventive_actions = Column(JSON, nullable=True)
    mitigation_strategies = Column(JSON, nullable=True)
    
    # Model
    model_used = Column(String(100), nullable=False)
    model_accuracy = Column(Float, nullable=True)
    training_data_period = Column(JSON, nullable=True)
    
    # Validation
    actual_value = Column(Float, nullable=True)  # Filled in after prediction date
    prediction_accuracy = Column(Float, nullable=True)
    validated_at = Column(DateTime, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    alerted = Column(Boolean, default=False)
    alerted_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())

class TrendAnalysis(Base):
    __tablename__ = "trend_analyses"

    id = Column(Integer, primary_key=True)
    
    # Trend Details
    trend_type = Column(String(100), nullable=False)  # TICKET_CATEGORY, REFUND_REASON, PRODUCT_ISSUE
    category = Column(String(100), nullable=False)
    subcategory = Column(String(100), nullable=True)
    
    # Trend Data
    trend_direction = Column(String(20), nullable=False)  # INCREASING, DECREASING, STABLE, VOLATILE
    trend_strength = Column(Float, nullable=False)  # 0-1
    change_percentage = Column(Float, nullable=True)
    
    # Time Period
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    comparison_period_start = Column(DateTime, nullable=True)
    comparison_period_end = Column(DateTime, nullable=True)
    
    # Metrics
    current_value = Column(Float, nullable=False)
    previous_value = Column(Float, nullable=True)
    peak_value = Column(Float, nullable=True)
    peak_date = Column(DateTime, nullable=True)
    
    # Analysis
    contributing_factors = Column(JSON, nullable=True)
    correlation_data = Column(JSON, nullable=True)
    
    # Visualization
    time_series_data = Column(JSON, nullable=True)
    
    # Insights
    key_findings = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    
    # Status
    is_significant = Column(Boolean, default=False)
    requires_attention = Column(Boolean, default=False)
    
    created_at = Column(DateTime, server_default=func.now())
