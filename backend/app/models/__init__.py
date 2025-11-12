from .base import Base
from .user import User, UserRole, Customer, Agent, Supervisor, Vendor
from .ticket import Ticket, Message, Attachment, TicketStatus, TicketPriority
from .order import Order, OrderItem, TrackingInfo, OrderStatus
from .product import Product, ProductComplaint, ComplaintStatus
from .analytics import AgentStats, SupervisorMetrics, ProductMetrics, Notification, Alert, AlertType, NotificationType
from .refund import RefundRequest, ReturnRequest, FraudCheck, ImageAnalysis, RejectionLog, RefundStatus, ReturnStatus, FraudRiskLevel
from .chat import ChatConversation, ChatMessage, KnowledgeBase, FAQItem, ConversationStatus, MessageSender
from .ai_copilot import TicketSummary, SuggestedResponse, ResponseTemplate, RefundExplanation
from .analytics_extended import AgentWorkload, SLATracking, TeamPerformance, AgentRating, ProductReturnAnalytics, TicketActivity, ShippingAddress
from .communication import EmailLog, WhatsAppLog, CommunicationTemplate, NotificationPreference, CommunicationStatus
from .insights import InsightLog, AutoLearnedPattern, PredictiveInsight, TrendAnalysis
