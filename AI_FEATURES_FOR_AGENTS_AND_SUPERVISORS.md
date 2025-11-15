# AI Features for Agents and Supervisors

## Overview

The AI Copilot system provides intelligent assistance to support agents and supervisors through automated ticket analysis, response suggestions, and performance insights. The system uses a local LLM (TinyLlama) to generate contextual, AI-powered recommendations while maintaining data privacy.

---

## Agent Features

### 1. Ticket Summarization

**Endpoint**: `GET /api/v1/copilot/tickets/{ticket_id}/summary`

**Purpose**: Automatically generates concise summaries of support tickets by analyzing the conversation history.

**Authentication**: Required (Agent role)

**Query Parameters**:
- `regenerate` (boolean, optional): Force regeneration of summary instead of using cached version

**Response**:
```json
{
  "id": "summary_id",
  "ticket_id": "TKT12345",
  "summary": "Customer received incorrect item - ordered blue t-shirt but got red hoodie. Agent processing exchange.",
  "key_points": [
    "Wrong item shipped",
    "Customer wants exchange",
    "Agent acknowledged error"
  ],
  "customer_sentiment": "NEGATIVE",
  "urgency_level": "HIGH",
  "detected_category": "Shipping Error",
  "confidence_score": 0.85,
  "cached": false
}
```

**Use Case**: When an agent opens a ticket, they immediately see an AI-generated summary highlighting the main issue, customer sentiment, and urgency level, allowing for faster response times.

---

### 2. Response Suggestions

**Endpoint**: `GET /api/v1/copilot/tickets/{ticket_id}/suggestions`

**Purpose**: Generates multiple contextual response suggestions based on ticket content and similar resolved cases.

**Authentication**: Required (Agent role)

**Response**:
```json
[
  {
    "id": 1,
    "response_text": "I sincerely apologize for the shipping error. I'm processing an immediate exchange with expedited shipping at no cost to you.",
    "response_type": "SOLUTION",
    "confidence_score": 0.88,
    "reasoning": "Empathetic response addressing specific error with immediate solution",
    "based_on_kb_articles": ["shipping_policy", "exchange_process"]
  },
  {
    "response_text": "I understand your frustration. Let me arrange a return pickup and send the correct item right away.",
    "response_type": "SOLUTION",
    "confidence_score": 0.82,
    "reasoning": "Direct solution-focused response appropriate for urgent situations"
  }
]
```

**Use Case**: Agents can select from AI-generated response suggestions, edit if needed, and send professional replies faster while maintaining quality and consistency.

---

### 3. Suggestion Feedback

**Endpoint**: `POST /api/v1/copilot/suggestions/{suggestion_id}/use`

**Purpose**: Record agent feedback on suggestion quality for continuous improvement.

**Authentication**: Required (Agent role)

**Request Body**:
```json
{
  "modified": false,
  "rating": 5,
  "comment": "Perfect suggestion, used as-is"
}
```

**Response**:
```json
{
  "message": "Feedback recorded successfully"
}
```

**Use Case**: Helps improve AI suggestions over time by learning which responses agents find most helpful.

---

### 4. Knowledge Base Search

**Endpoint**: `GET /api/v1/copilot/knowledge-base/search`

**Purpose**: Search company policies and procedures using natural language queries.

**Authentication**: Required (Agent role)

**Query Parameters**:
- `query` (string, required): Search query
- `category` (string, optional): Filter by category

**Response**:
```json
{
  "query": "refund policy for defective products",
  "results": [
    {
      "title": "Refund Policy - Defective Products",
      "category": "Policy",
      "excerpt": "Customers can request full refunds for defective products within 30 days...",
      "relevance_score": 0.95,
      "tags": ["refund", "defective", "policy"]
    }
  ]
}
```

**Use Case**: Agents can quickly find relevant policies and procedures while handling tickets, ensuring accurate and consistent responses.

---

### 5. Knowledge Base Categories

**Endpoint**: `GET /api/v1/copilot/knowledge-base/categories`

**Purpose**: List all available knowledge base categories with document counts.

**Authentication**: Required (Agent role)

**Response**:
```json
{
  "categories": [
    {"name": "Policy", "count": 6},
    {"name": "Standard Operating Procedure", "count": 4},
    {"name": "Escalation Rules", "count": 1}
  ],
  "total_documents": 19
}
```

---

## Supervisor Features

### 1. Team Performance Insights

**Endpoint**: `GET /api/v1/copilot/supervisor/team-insights`

**Purpose**: AI-powered analysis of team performance with actionable recommendations.

**Authentication**: Required (Supervisor role)

**Query Parameters**:
- `time_range` (string): "24h", "7d", "30d" (default: "7d")

**Response**:
```json
{
  "time_range": "7d",
  "period_name": "last 7 days",
  "team_statistics": {
    "total_agents": 5,
    "total_tickets": 127,
    "total_resolved": 98,
    "resolution_rate": 77.2,
    "priority_distribution": {
      "HIGH": 23,
      "MEDIUM": 67,
      "LOW": 37
    }
  },
  "agent_performance": [
    {
      "agent_name": "Sarah Johnson",
      "tickets_handled": 32,
      "tickets_resolved": 28,
      "avg_resolution_hours": 4.5,
      "resolution_rate": 87.5
    }
  ],
  "ai_insights": {
    "overall_assessment": "Team performed well with 77.2% resolution rate. Response times within acceptable ranges.",
    "top_performers": [
      "Sarah Johnson - Highest resolution rate with fastest response time",
      "Mike Chen - Consistent performance with strong customer satisfaction"
    ],
    "areas_for_improvement": [
      "Medium-priority ticket resolution could be improved",
      "Weekend coverage shows lower resolution rates"
    ],
    "recommendations": [
      "Provide additional training on medium-priority ticket triage",
      "Consider adding weekend shift coverage",
      "Share best practices from top performers"
    ],
    "trends": [
      "Ticket volume increased 15% compared to previous week",
      "Customer satisfaction improved from 4.1 to 4.3"
    ],
    "workload_balance": "BALANCED"
  }
}
```

**Use Case**: Supervisors get AI-generated insights about team performance, identify top performers, spot areas needing attention, and receive actionable recommendations.

---

### 2. Individual Agent Performance Analysis

**Endpoint**: `GET /api/v1/copilot/supervisor/agent-performance/{agent_id}`

**Purpose**: Detailed AI analysis of individual agent performance with coaching recommendations.

**Authentication**: Required (Supervisor role)

**Query Parameters**:
- `time_range` (string): "7d", "30d", "90d" (default: "30d")

**Response**:
```json
{
  "agent_id": 2,
  "agent_name": "Sarah Johnson",
  "time_range": "30d",
  "metrics": {
    "total_tickets": 145,
    "resolved_tickets": 128,
    "resolution_rate": 88.3,
    "avg_resolution_hours": 4.2,
    "positive_sentiment": 98,
    "negative_sentiment": 12
  },
  "ai_analysis": {
    "performance_summary": "Sarah demonstrates exceptional performance with 88.3% resolution rate and consistently positive customer feedback.",
    "strengths": [
      "Excellent resolution rate - consistently above team average",
      "Fast response times with high-quality solutions",
      "Strong customer satisfaction - 89% positive sentiment"
    ],
    "improvement_areas": [
      "Could benefit from delegating simpler tickets",
      "Documentation could be more detailed for knowledge sharing"
    ],
    "coaching_recommendations": [
      "Encourage Sarah to mentor junior agents",
      "Discuss time management strategies",
      "Consider promoting to senior agent role"
    ],
    "training_suggestions": [
      "Leadership and mentoring skills workshop",
      "Advanced technical troubleshooting certification"
    ],
    "performance_trend": "IMPROVING"
  }
}
```

**Use Case**: Supervisors receive detailed, AI-generated performance analysis for individual agents with specific coaching recommendations and training suggestions.

---

### 3. Automated Report Generation

**Endpoint**: `POST /api/v1/copilot/supervisor/generate-report`

**Purpose**: Generate comprehensive AI-powered performance reports.

**Authentication**: Required (Supervisor role)

**Request Body**:
```json
{
  "type": "weekly",
  "include_agents": true,
  "include_trends": true
}
```

**Response**:
```json
{
  "report_type": "weekly",
  "period": "Weekly",
  "generated_at": "2024-11-15T10:30:00Z",
  "statistics": {
    "total_tickets": 127,
    "resolved_tickets": 98,
    "resolution_rate": 77.2,
    "active_agents": 5
  },
  "report": {
    "executive_summary": "Weekly report: 127 tickets processed with 77.2% resolution rate. Team maintained strong performance.",
    "key_metrics": {
      "total_tickets": 127,
      "resolution_rate": "77.2%"
    },
    "highlights": [
      "Team maintained operations",
      "Customer satisfaction improved",
      "Response times within target"
    ],
    "challenges": [
      "Weekend coverage needs attention",
      "Medium-priority backlog growing"
    ],
    "action_items": [
      "Review weekend staffing",
      "Implement priority triage training",
      "Monitor medium-priority queue"
    ],
    "forecast": "Stable operations expected with slight volume increase"
  }
}
```

**Use Case**: Supervisors can generate comprehensive reports for management with AI-generated insights, trends, and recommendations.

---

### 4. Refund Decision Explanations

**Endpoint**: `GET /api/v1/copilot/refunds/{refund_id}/explanation`

**Purpose**: AI-generated explanations for refund approval/rejection decisions, particularly for fraud-flagged cases.

**Authentication**: Required (Agent or Supervisor role)

**Response**:
```json
{
  "id": 1,
  "decision": "NEEDS_REVIEW",
  "agent_explanation": "This refund request has been flagged with fraud score of 75/100 due to new account with multiple high-value orders in short timeframe.",
  "customer_explanation": "We need to verify some information before processing your refund. This is standard security procedure for new accounts.",
  "reasoning_points": [
    "New account (5 days old) with high-value purchases",
    "Multiple orders in short timeframe",
    "Refund requested within 24 hours of delivery"
  ],
  "policy_sections": [
    "New Account Verification Policy",
    "High-Value Refund Review Process"
  ],
  "next_steps": [
    "Request customer verification documents",
    "Review customer ID and proof of address",
    "Escalate to fraud team if verification fails"
  ],
  "confidence_score": 0.89
}
```

**Use Case**: Agents and supervisors get clear, AI-generated explanations for why refunds are flagged, with both technical details for internal use and customer-friendly explanations.

---

## System Health

### Health Check

**Endpoint**: `GET /api/v1/copilot/health`

**Purpose**: Check AI service availability and status.

**Authentication**: Not required

**Response**:
```json
{
  "llm_service": "available",
  "knowledge_base": "19 documents loaded",
  "status": "healthy"
}
```

**Status Values**:
- `healthy`: All AI services operational
- `degraded`: AI services unavailable, using fallback responses

---

## Technical Details

### AI Model

**Model**: TinyLlama
**Size**: 637 MB
**Deployment**: Local (Ollama)
**Privacy**: All processing done locally, no external API calls

### Performance

**Average Response Times**:
- Ticket Summary: 10-15 seconds
- Response Suggestions: 15-20 seconds
- Team Insights: 20-30 seconds
- Knowledge Base Search: Less than 1 second

**Note**: First request may take longer as the model loads into memory.

### Data Privacy

- All AI processing happens locally on your server
- No customer data sent to external services
- Full control over data and model
- GDPR and privacy regulation compliant

### Caching

- Ticket summaries are cached to improve performance
- Use `regenerate=true` parameter to force fresh generation
- Cache invalidated when ticket is updated

---

## Best Practices

### For Agents

1. **Review AI Suggestions**: Always review and edit AI-generated responses before sending to customers
2. **Provide Feedback**: Rate suggestions to help improve AI quality over time
3. **Use Knowledge Base**: Search policies before responding to ensure accuracy
4. **Check Confidence Scores**: Lower confidence scores may need more careful review

### For Supervisors

1. **Regular Reviews**: Check team insights weekly to identify trends early
2. **Act on Recommendations**: AI recommendations are based on data patterns - consider implementing them
3. **Individual Coaching**: Use agent performance analysis for targeted coaching sessions
4. **Share Best Practices**: Identify and share practices from top performers with the team

### For System Administrators

1. **Monitor Health**: Regularly check `/copilot/health` endpoint
2. **Update Knowledge Base**: Keep policies and procedures current
3. **Review Feedback**: Analyze agent feedback to improve AI quality
4. **Performance Monitoring**: Track response times and adjust resources if needed

---

## Error Handling

### Common Error Responses

**503 Service Unavailable**
```json
{
  "detail": "AI service temporarily unavailable"
}
```
**Cause**: Ollama service not running or model not loaded
**Solution**: System will use fallback responses automatically

**404 Not Found**
```json
{
  "detail": "Ticket not found"
}
```
**Cause**: Invalid ticket ID
**Solution**: Verify ticket ID exists

**403 Forbidden**
```json
{
  "detail": "Insufficient permissions"
}
```
**Cause**: User role doesn't have access to endpoint
**Solution**: Ensure user has Agent or Supervisor role

---

## Limitations

1. **Response Quality**: TinyLlama is a small model optimized for speed and low resource usage. Responses are good but not as sophisticated as larger models.

2. **Context Window**: Limited to analyzing the most recent conversation history (last 10 messages).

3. **Language**: Currently optimized for English language support.

4. **Real-time Updates**: Summaries are cached and may not reflect very recent ticket updates unless regenerated.

---

## Future Enhancements

Planned improvements for future releases:

- Multi-language support
- Larger model options for better quality
- Real-time suggestion updates
- Advanced analytics dashboard
- Custom model fine-tuning on company data
- Voice-to-text integration
- Proactive issue detection

---

## Support

For technical issues or questions:

1. Check system health: `GET /api/v1/copilot/health`
2. Review API documentation: `/docs` (Swagger UI)
3. Contact system administrator

---

**Version**: 1.0  
**Last Updated**: November 2024  
**Status**: Production Ready
