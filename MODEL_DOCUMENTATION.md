# Model Documentation

Complete documentation of all 41 database models explaining why each is necessary and what data components they contain.

## Table of Contents
1. User & Authentication Models
2. Ticket System Models
3. Order & Product Models
4. Refund & Return Models
5. AI Chatbot Models
6. AI Copilot Models
7. Analytics & Tracking Models
8. Communication Models
9. Insights Models

---

## 1. USER & AUTHENTICATION MODELS

### User Model
Location: backend/app/models/user.py
Required for: All 10 features (base authentication)

Purpose: Core authentication table for all system users

Key Fields:
- id: Unique identifier for each user
- email: Login username, must be unique across system
- password: Hashed using bcrypt for security
- role: Determines which features user can access (CUSTOMER, AGENT, SUPERVISOR, VENDOR)
- is_active: Allows account suspension without data deletion
- last_login: Security tracking and activity monitoring
- created_at/updated_at: Audit trail for compliance

Why necessary: Every person using the system needs authentication. This is the foundation for role-based access control.

### Customer Model
Location: backend/app/models/user.py
Required for: Features 2, 8 (Refund Assistant, Customer Portal)

Purpose: Stores customer-specific data for end users

Key Fields:
- phone: Contact for delivery updates
- preferences: JSON storing notification settings, language, theme
- total_orders/total_tickets: Activity metrics for analytics
- loyalty_points: Rewards program for customer retention
- member_since: Account age for VIP status determination

Why necessary: Customers need additional data beyond basic authentication (contact info, preferences, loyalty tracking).

### Agent Model
Location: backend/app/models/user.py
Required for: Features 1, 4, 5 (Ticket Management, AI Copilot, Agent Dashboard)

Purpose: Support staff who handle customer tickets

Key Fields:
- status: Real-time availability (AVAILABLE, BUSY, OFFLINE, BREAK)
- skills: JSON array for skill-based routing (e.g., ["billing", "technical"])
- languages: Multi-language support matching
- max_concurrent_tickets: Prevents agent overload
- response_time: Performance metric for SLA tracking
- satisfaction_rating: Customer feedback score

Why necessary: Agents need workload management, skill-based routing, and performance tracking. Without this, tickets would be randomly assigned regardless of agent capacity or expertise.

### Supervisor Model
Location: backend/app/models/user.py
Required for: Features 1, 4, 6 (Ticket Management, AI Copilot, Supervisor Analytics)

Purpose: Managers who oversee support teams

Key Fields:
- team_size: Number of agents supervised
- managed_departments: Which departments they oversee
- escalation_level: Determines which escalated tickets they can handle

Why necessary: Supervisors need different permissions than agents (view all tickets, reassign, access analytics). This model enables hierarchical management.

### Vendor Model
Location: backend/app/models/user.py
Required for: Feature 7 (Vendor Product Quality Analytics)

Purpose: Product sellers who manage inventory

Key Fields:
- company_name/business_license/tax_id: Legal compliance
- contact_email/contact_phone: Business communication
- product_categories: Catalog organization
- rating: Vendor reputation score
- verified: Platform verification status

Why necessary: Vendors need business-specific data for legal compliance, payments, and quality control. Separates business entities from individual users.

---

## 2. TICKET SYSTEM MODELS

### Ticket Model
Location: backend/app/models/ticket.py
Required for: Features 1, 4, 5, 6, 8

Purpose: Core support request tracking

Key Fields:
- subject/description: Issue details
- category/subcategory: Classification for routing
- status: Lifecycle tracking (OPEN → IN_PROGRESS → RESOLVED → CLOSED)
- priority: SLA determination (LOW, MEDIUM, HIGH, CRITICAL)
- agent_id: Assignment tracking
- ai_suggested_solution: AI Copilot recommendations
- sentiment: Customer emotion detection
- sla_deadline: Performance monitoring
- reopened_count: Quality metric

Why necessary: Tickets are the core of the support system. Without this, there's no way to track customer issues from creation to resolution.

### Message Model
Location: backend/app/models/ticket.py
Required for: Features 1, 4, 5

Purpose: Conversation history within tickets

Key Fields:
- content: Message text
- sender_id: Who sent it
- message_type: TEXT, IMAGE, FILE, SYSTEM
- ai_generated: Tracks AI suggestion usage
- is_internal: Agent-only notes
- created_at: Conversation ordering

Why necessary: Full conversation history is required for context, quality assurance, and training AI models. Without messages, tickets would just be status updates with no communication.

### Attachment Model
Location: backend/app/models/ticket.py
Required for: Feature 1

Purpose: File uploads in conversations

Key Fields:
- file_name/file_path: Storage management
- file_url: Download access
- file_size/file_type: Display and validation
- message_id: Links to specific message

Why necessary: Customers need to send screenshots, receipts, product photos. Agents need to send return labels, instructions. Essential for visual problem-solving.

---

## 3. ORDER & PRODUCT MODELS

### Order Model
Location: backend/app/models/order.py
Required for: Features 2, 7, 8

Purpose: E-commerce order tracking

Key Fields:
- order_number: Human-readable identifier
- subtotal/tax/shipping_cost/discount/total: Financial breakdown
- payment_method/payment_status: Payment tracking
- shipping_address/billing_address: Delivery information
- tracking_number: Shipment tracking
- status: Order lifecycle (PENDING → PROCESSING → SHIPPED → DELIVERED)

Why necessary: Orders are what customers want refunds for. Without order data, the refund system cannot function. Also needed for order tracking in customer portal.

### Product Model
Location: backend/app/models/product.py
Required for: Features 2, 7

Purpose: Product catalog and inventory

Key Fields:
- sku: Product code
- name/description/price: Product details
- stock_quantity: Inventory management
- images: Product photos
- vendor_id: Who sells it
- rating/review_count: Social proof
- total_complaints/return_rate: Quality metrics

Why necessary: Products are what get returned. Vendor analytics need product data to track quality issues. Inventory management prevents overselling.

### ProductComplaint Model
Location: backend/app/models/product.py
Required for: Feature 7

Purpose: Product quality issue tracking

Key Fields:
- product_id/customer_id: Links complaint to product and customer
- description: Issue details
- severity: Impact level
- status: Resolution tracking
- resolution: How it was fixed

Why necessary: Vendors need to know which products have quality issues. Platform needs to identify problematic products for removal. Customers need complaint history.

---

## 4. REFUND & RETURN MODELS

### RefundRequest Model
Location: backend/app/models/refund.py
Required for: Features 2, 3

Purpose: Customer refund request tracking

Key Fields:
- order_id: Which order to refund
- amount/reason: Refund details
- status: Workflow (REQUESTED → UNDER_REVIEW → APPROVED/REJECTED → PROCESSED)
- ai_eligibility_check: AI determines if eligible
- ai_fraud_score: Fraud detection
- reviewed_by/processed_by: Audit trail
- transaction_id: Payment tracking

Why necessary: Core of Feature 2 (Refund Assistant). Tracks refund lifecycle from request through payment. AI fields enable automated eligibility checking.

### ReturnRequest Model
Location: backend/app/models/refund.py
Required for: Features 2, 3

Purpose: Product return management

Key Fields:
- items_to_return: JSON array of products
- return_shipping_label: Label URL
- pickup_address/pickup_date: Logistics
- tracking_number: Shipment tracking
- inspection_notes/inspection_images: Quality check
- condition_rating: Product condition (1-5)
- ai_fraud_check: Fraud detection

Why necessary: Returns must be tracked separately from refunds (return first, then refund). Inspection data prevents fraud. Logistics fields enable pickup scheduling.

### FraudCheck Model
Location: backend/app/models/refund.py
Required for: Feature 3

Purpose: AI-powered fraud detection

Key Fields:
- risk_level: LOW, MEDIUM, HIGH, CRITICAL
- fraud_score: 0-100 numerical score
- fraud_indicators: JSON array of detected issues
- customer_history_score: Past behavior analysis
- pattern_match_score: Matches known fraud patterns
- flagged_for_review: Requires human review
- auto_rejected: System automatically rejected

Why necessary: Feature 3 requires fraud detection. Without this, fraudulent refunds would be approved. Saves money by catching fraud early.

### ImageAnalysis Model
Location: backend/app/models/refund.py
Required for: Feature 3

Purpose: AI image verification for returns

Key Fields:
- return_request_id: Which return this analyzes
- image_url: Image being analyzed
- product_detected: AI found product in image
- product_match_score: Matches original product
- condition_score: Product condition (0-100)
- damage_detected/damage_type: Damage analysis
- tampering_detected: Fraud indicator
- authenticity_score: Real vs fake product

Why necessary: Customers could send photos of different/fake products. AI verifies images match what was ordered. Critical for fraud prevention.

### RejectionLog Model
Location: backend/app/models/refund.py
Required for: Feature 3

Purpose: Tracks all rejections with appeal process

Key Fields:
- refund_request_id/return_request_id: What was rejected
- rejection_reason/rejection_category: Why rejected
- rejected_by_system: Auto vs manual rejection
- fraud_related: Fraud indicator
- appeal_submitted/appeal_status: Appeal workflow
- customer_notified: Communication tracking

Why necessary: Customers need to know why requests were rejected. Appeals process requires tracking. Analytics need rejection data to improve policies.

---

## 5. AI CHATBOT MODELS

### ChatConversation Model
Location: backend/app/models/chat.py
Required for: Features 2, 8

Purpose: RAG chatbot session tracking

Key Fields:
- customer_id: Who is chatting
- status: ACTIVE, RESOLVED, ESCALATED, ABANDONED
- topic/intent: What customer wants (refund, return, order_status)
- escalated_to_ticket_id: If escalated to human agent
- satisfaction_rating: Chatbot effectiveness
- message_count: Conversation length

Why necessary: Feature 2 requires chatbot for refund assistance. Conversations must be tracked for context and analytics. Escalation to human agents requires linking.

### ChatMessage Model
Location: backend/app/models/chat.py
Required for: Features 2, 8

Purpose: Individual chatbot messages

Key Fields:
- conversation_id: Which chat session
- sender_type: CUSTOMER, AI, AGENT, SYSTEM
- content: Message text
- intent/entities: NLP extraction
- sentiment: Customer emotion
- ai_model_used: Which AI model generated response
- rag_sources: Knowledge base articles used
- helpful: Customer feedback

Why necessary: Full chat history needed for context. RAG sources show which knowledge base articles were used. Intent/entity extraction enables intelligent responses.

### KnowledgeBase Model
Location: backend/app/models/chat.py
Required for: Features 2, 10

Purpose: Knowledge articles for RAG retrieval

Key Fields:
- title/content: Article text
- category/subcategory: Organization
- tags/keywords: Search optimization
- embedding_vector: Vector for RAG similarity search
- helpful_count/not_helpful_count: Quality metrics
- used_in_chat_count: Usage tracking
- is_active: Publish status

Why necessary: RAG chatbot needs knowledge base to retrieve answers from. Without this, chatbot would only use general AI knowledge. Embeddings enable semantic search.

### FAQItem Model
Location: backend/app/models/chat.py
Required for: Features 2, 10

Purpose: Auto-generated FAQs from tickets

Key Fields:
- question/answer: FAQ content
- auto_generated: AI created vs human written
- source_ticket_ids: Which tickets this learned from
- confidence_score: AI confidence
- helpful_count: User feedback
- reviewed: Human verification status

Why necessary: Feature 10 auto-learns from solved tickets. FAQs reduce ticket volume by answering common questions. Confidence score determines if human review needed.

---

## 6. AI COPILOT MODELS

### TicketSummary Model
Location: backend/app/models/ai_copilot.py
Required for: Features 4, 5, 6

Purpose: AI-generated ticket summaries

Key Fields:
- ticket_id: Which ticket summarized
- summary: Brief overview
- key_points: JSON array of main issues
- customer_sentiment: Emotion analysis
- urgency_level: Priority recommendation
- detected_category: AI classification
- model_used: Which AI model
- helpful_count: Agent feedback

Why necessary: Feature 4 requires AI summaries for agents. Long tickets need quick overview. Supervisors need summaries for monitoring. Saves agent time.

### SuggestedResponse Model
Location: backend/app/models/ai_copilot.py
Required for: Features 4, 5

Purpose: AI-suggested agent responses

Key Fields:
- ticket_id: Which ticket this is for
- response_text: Suggested reply
- response_type: SOLUTION, CLARIFICATION, ESCALATION, CLOSING
- confidence_score: AI confidence
- reasoning: Why this response suggested
- based_on_tickets: Similar resolved tickets
- used: Agent actually used it
- feedback_rating: Agent feedback

Why necessary: Feature 4 AI Copilot suggests responses. Speeds up agent work. Tracks usage to improve suggestions. Based on past successful resolutions.

### ResponseTemplate Model
Location: backend/app/models/ai_copilot.py
Required for: Features 4, 5

Purpose: Quick response templates

Key Fields:
- title/content: Template text
- category: When to use it
- variables: Placeholders like {customer_name}
- agent_id: Owner (NULL for shared)
- is_shared: Available to all agents
- usage_count: Popularity tracking
- success_rate: Resolution effectiveness

Why necessary: Agents answer same questions repeatedly. Templates save time. Shared templates ensure consistent messaging. Usage tracking identifies best templates.

### RefundExplanation Model
Location: backend/app/models/ai_copilot.py
Required for: Features 2, 4

Purpose: AI explanations for refund decisions

Key Fields:
- refund_request_id: Which refund explained
- explanation: Why approved/rejected
- decision: APPROVED, REJECTED, NEEDS_REVIEW
- reasoning_points: JSON array of reasons
- policy_sections: Relevant policy references
- customer_explanation: Simplified version for customer
- agent_notes: Additional context for agents

Why necessary: Feature 2 requires explaining refund decisions. Customers need to understand why rejected. Agents need policy references. Transparency builds trust.

---

## 7. ANALYTICS & TRACKING MODELS

### AgentWorkload Model
Location: backend/app/models/analytics_extended.py
Required for: Features 5, 6

Purpose: Real-time agent capacity tracking

Key Fields:
- agent_id/date: Daily tracking per agent
- assigned_tickets/active_tickets/resolved_tickets: Workload metrics
- total_work_time_minutes: Time tracking
- avg_response_time/avg_resolution_time: Performance
- sla_met_count/sla_missed_count: SLA compliance
- current_capacity_percentage: Based on max_concurrent_tickets
- available_for_assignment: Can receive new tickets

Why necessary: Feature 5 Agent Dashboard needs workload data. Prevents agent burnout. System uses capacity to determine assignment. Supervisors monitor team workload.

### SLATracking Model
Location: backend/app/models/analytics_extended.py
Required for: Features 1, 5, 6

Purpose: SLA compliance monitoring per ticket

Key Fields:
- ticket_id: Which ticket tracked
- first_response_target/resolution_target: SLA goals in minutes
- first_response_time/resolution_time: Actual times
- first_response_met/resolution_met: Pass/fail
- breach_minutes: How much over target
- paused_time_minutes: Time waiting for customer (excluded from SLA)

Why necessary: SLA compliance is critical for support quality. Agents need SLA indicators. Supervisors need compliance reports. Customers expect timely responses.

### TeamPerformance Model
Location: backend/app/models/analytics_extended.py
Required for: Feature 6

Purpose: Supervisor team metrics

Key Fields:
- supervisor_id/date: Daily team tracking
- team_size/active_agents: Team composition
- total_tickets_assigned/resolved/escalated: Team workload
- avg_resolution_time: Team efficiency
- sla_compliance_rate: Team SLA performance
- avg_customer_satisfaction: Team quality
- department_metrics: JSON breakdown by department

Why necessary: Feature 6 Supervisor Dashboard needs team analytics. Identifies underperforming teams. Tracks team trends over time. Enables data-driven management.

### AgentRating Model
Location: backend/app/models/analytics_extended.py
Required for: Feature 6

Purpose: Customer feedback on agents

Key Fields:
- agent_id/ticket_id/customer_id: Rating context
- rating: Overall score (1-5)
- professionalism/responsiveness/knowledge/problem_solving: Category ratings
- feedback: Text comments
- sentiment: Emotion analysis
- resolution_time_minutes: Context for rating

Why necessary: Feature 6 needs agent quality metrics. Identifies training needs. Rewards high performers. Customer feedback improves service quality.

### ProductReturnAnalytics Model
Location: backend/app/models/analytics_extended.py
Required for: Feature 7

Purpose: Vendor product quality tracking

Key Fields:
- product_id/vendor_id/date: Daily product tracking
- total_returns/total_sales/return_rate: Return metrics
- reason_breakdown: JSON of return reasons
- total_refund_amount: Financial impact
- defect_count/damage_count: Quality issues
- fraud_suspected_count: Fraud tracking
- trend_direction: INCREASING, DECREASING, STABLE

Why necessary: Feature 7 Vendor Analytics needs return data. Identifies problematic products. Vendors see quality trends. Platform can remove bad products.

### TicketActivity Model
Location: backend/app/models/analytics_extended.py
Required for: Features 1, 6

Purpose: Audit trail for ticket changes

Key Fields:
- ticket_id/user_id: What changed and who changed it
- activity_type: CREATED, ASSIGNED, STATUS_CHANGED, PRIORITY_CHANGED
- description: Human-readable change description
- field_changed/old_value/new_value: Detailed change tracking
- ip_address/user_agent: Security tracking

Why necessary: Compliance requires audit trails. Debugging needs change history. Supervisors monitor agent actions. Security tracking for suspicious activity.

### ShippingAddress Model
Location: backend/app/models/analytics_extended.py
Required for: Feature 8

Purpose: Customer delivery addresses

Key Fields:
- customer_id: Address owner
- label: "Home", "Office", etc.
- full_name/phone: Delivery contact
- address_line1/address_line2/city/state/postal_code/country: Full address
- is_default: Primary address
- verified: Address validation status

Why necessary: Feature 8 Customer Portal needs address management. Orders need shipping addresses. Multiple addresses per customer. Address verification prevents delivery failures.

---

## 8. COMMUNICATION MODELS

### EmailLog Model
Location: backend/app/models/communication.py
Required for: Feature 9

Purpose: Email tracking

Key Fields:
- user_id/ticket_id/refund_request_id/order_id: Context linking
- to_email/from_email/subject/body: Email content
- template_id: Which template used
- status: PENDING, SENT, DELIVERED, FAILED
- sent_at/delivered_at/opened_at/clicked_at: Tracking
- provider_message_id: External provider tracking

Why necessary: Feature 9 requires email notifications. Tracking ensures delivery. Open/click tracking measures engagement. Failed emails need retry.

### WhatsAppLog Model
Location: backend/app/models/communication.py
Required for: Feature 9

Purpose: WhatsApp message tracking

Key Fields:
- user_id/ticket_id/refund_request_id/order_id: Context linking
- to_phone/from_phone/message_text: Message content
- template_name: WhatsApp template used
- status: PENDING, SENT, DELIVERED, FAILED
- sent_at/delivered_at/read_at: Tracking
- provider_message_id: Twilio/WhatsApp API tracking

Why necessary: Feature 9 requires WhatsApp notifications. Many customers prefer WhatsApp over email. Read receipts show engagement. International customers use WhatsApp.

### CommunicationTemplate Model
Location: backend/app/models/communication.py
Required for: Feature 9

Purpose: Email/WhatsApp templates

Key Fields:
- name/description: Template identification
- channel: EMAIL, WHATSAPP, SMS
- category: TICKET_UPDATE, REFUND_STATUS, ORDER_SHIPPED
- email_subject/email_body: Email version
- whatsapp_message: WhatsApp version
- variables: Available placeholders
- usage_count: Popularity tracking

Why necessary: Consistent messaging across channels. Templates ensure professional communication. Variables enable personalization. Usage tracking identifies popular templates.

### NotificationPreference Model
Location: backend/app/models/communication.py
Required for: Feature 9

Purpose: User notification settings

Key Fields:
- user_id: Preference owner
- email_enabled/whatsapp_enabled/inapp_enabled: Channel preferences
- email_ticket_updates/email_order_updates/email_refund_updates: Category preferences
- digest_frequency: IMMEDIATE, DAILY, WEEKLY
- quiet_hours_start/quiet_hours_end: Do not disturb

Why necessary: Users need control over notifications. Reduces spam complaints. Respects quiet hours. Different preferences per notification type.

---

## 9. INSIGHTS MODELS

### InsightLog Model
Location: backend/app/models/insights.py
Required for: Feature 10

Purpose: AI-generated business insights

Key Fields:
- insight_type: TREND, ANOMALY, PREDICTION, RECOMMENDATION
- category: TICKET, REFUND, PRODUCT, AGENT, CUSTOMER
- title/description: Insight content
- severity: LOW, MEDIUM, HIGH, CRITICAL
- confidence_score: AI confidence
- recommended_actions: JSON array of suggestions
- reviewed/action_taken: Follow-up tracking

Why necessary: Feature 10 generates insights from data. Identifies problems automatically. Recommends actions. Tracks if insights were acted upon.

### AutoLearnedPattern Model
Location: backend/app/models/insights.py
Required for: Feature 10

Purpose: Patterns learned from tickets

Key Fields:
- pattern_type: COMMON_ISSUE, RESOLUTION_PATH, CUSTOMER_BEHAVIOR
- pattern_name/description: Pattern details
- pattern_signature: JSON of key characteristics
- occurrence_count: How often seen
- success_rate: Resolution effectiveness
- learned_from_tickets: Source tickets
- applied_to_kb/applied_to_faq: Where pattern used

Why necessary: Feature 10 auto-learns from solved tickets. Identifies recurring issues. Creates knowledge base articles automatically. Improves over time.

### PredictiveInsight Model
Location: backend/app/models/insights.py
Required for: Feature 10

Purpose: Future predictions

Key Fields:
- prediction_type: TICKET_VOLUME, REFUND_SPIKE, PRODUCT_ISSUE, AGENT_BURNOUT
- target_entity_type/target_entity_id: What prediction is about
- prediction/predicted_value: Prediction details
- prediction_date: When prediction is for
- confidence_score: AI confidence
- potential_impact: Business impact
- preventive_actions: JSON of recommendations
- actual_value: Filled in after prediction date for accuracy tracking

Why necessary: Feature 10 predicts future issues. Enables proactive management. Prevents problems before they occur. Accuracy tracking improves predictions.

### TrendAnalysis Model
Location: backend/app/models/insights.py
Required for: Feature 10

Purpose: Trend detection and analysis

Key Fields:
- trend_type: TICKET_CATEGORY, REFUND_REASON, PRODUCT_ISSUE
- category/subcategory: What trend is about
- trend_direction: INCREASING, DECREASING, STABLE, VOLATILE
- trend_strength: 0-1 score
- change_percentage: Magnitude of change
- period_start/period_end: Time range analyzed
- current_value/previous_value: Comparison
- contributing_factors: JSON of causes
- time_series_data: JSON for charts

Why necessary: Feature 10 detects trends in data. Identifies growing problems. Shows seasonal patterns. Enables data-driven decisions.

---

## SUMMARY

Total Models: 41
- User & Auth: 5 models
- Ticket System: 3 models
- Order & Product: 4 models
- Refund & Return: 5 models
- AI Chatbot: 4 models
- AI Copilot: 4 models
- Analytics: 7 models
- Communication: 4 models
- Insights: 4 models
- Supporting: 1 model (Base)

All models are necessary for the 10 features to function properly. Each model serves a specific purpose and contains only the data components required for its function. The design follows database normalization principles while maintaining practical usability.
