"""
AI Copilot API Endpoints
Provides AI assistance for agents and supervisors
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Optional, Dict
from datetime import datetime, timedelta
import uuid
import json

from app.database import get_db
from app.models.user import User, Agent
from app.models.ticket import Ticket, Message
from app.models.ai_copilot import TicketSummary, SuggestedResponse, RefundExplanation
from app.models.refund import RefundRequest, FraudCheck
from app.services.auth import get_current_user
from app.services.copilot_service import copilot_service

router = APIRouter(prefix="/copilot", tags=["AI Copilot"])

@router.get("/health")
def check_copilot_health():
    """Check if AI Copilot services are available"""
    llm_available = copilot_service.llm.check_health()
    kb_loaded = len(copilot_service.kb.documents) > 0
    
    return {
        "llm_service": "available" if llm_available else "unavailable",
        "knowledge_base": f"{len(copilot_service.kb.documents)} documents loaded",
        "status": "healthy" if llm_available else "degraded"
    }

@router.get("/tickets/{ticket_id}/summary")
def get_ticket_summary(
    ticket_id: str,
    regenerate: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get or generate AI summary for a ticket
    If summary exists and regenerate=False, return cached version
    """
    
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    if not regenerate:
        existing_summary = db.query(TicketSummary).filter(
            TicketSummary.ticket_id == ticket_id
        ).first()
        
        if existing_summary:
            return {
                "id": existing_summary.id,
                "ticket_id": existing_summary.ticket_id,
                "summary": existing_summary.summary,
                "key_points": existing_summary.key_points,
                "customer_sentiment": existing_summary.customer_sentiment,
                "urgency_level": existing_summary.urgency_level,
                "detected_category": existing_summary.detected_category,
                "model_used": existing_summary.model_used,
                "confidence_score": existing_summary.confidence_score,
                "created_at": existing_summary.created_at,
                "cached": True
            }
    
    messages = db.query(Message).filter(
        Message.ticket_id == ticket_id
    ).order_by(Message.created_at).all()
    
    if not messages:
        raise HTTPException(status_code=400, detail="No messages to summarize")
    
    summary_data = copilot_service.generate_ticket_summary(ticket, messages, db)
    
    if regenerate:
        existing = db.query(TicketSummary).filter(TicketSummary.ticket_id == ticket_id).first()
        if existing:
            db.delete(existing)
            db.flush()
    
    summary = TicketSummary(
        ticket_id=ticket_id,
        summary=summary_data.get('summary', ''),
        key_points=summary_data.get('key_points', []),
        customer_sentiment=summary_data.get('customer_sentiment'),
        urgency_level=summary_data.get('urgency_level'),
        detected_category=summary_data.get('detected_category'),
        model_used=summary_data.get('model_used'),
        confidence_score=summary_data.get('confidence_score'),
        generation_time_ms=summary_data.get('generation_time_ms'),
        viewed_by_agents=[current_user.id]
    )
    
    db.add(summary)
    db.commit()
    db.refresh(summary)
    
    return {
        "id": summary.id,
        "ticket_id": summary.ticket_id,
        "summary": summary.summary,
        "key_points": summary.key_points,
        "customer_sentiment": summary.customer_sentiment,
        "urgency_level": summary.urgency_level,
        "detected_category": summary.detected_category,
        "model_used": summary.model_used,
        "confidence_score": summary.confidence_score,
        "created_at": summary.created_at,
        "cached": False
    }

@router.get("/tickets/{ticket_id}/suggestions")
def get_response_suggestions(
    ticket_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-generated response suggestions for a ticket
    """
    
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    messages = db.query(Message).filter(
        Message.ticket_id == ticket_id
    ).order_by(Message.created_at).all()
    
    if not messages:
        raise HTTPException(status_code=400, detail="No messages to analyze")
    
    customer = db.query(User).filter(User.id == ticket.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    suggestions_data = copilot_service.generate_response_suggestions(
        ticket, messages, customer, db
    )
    
    result = []
    for suggestion_data in suggestions_data:
        suggestion = SuggestedResponse(
            ticket_id=ticket_id,
            agent_id=current_user.id,
            response_text=suggestion_data.get('response_text', ''),
            response_type=suggestion_data.get('response_type', 'SOLUTION'),
            confidence_score=suggestion_data.get('confidence', 0.7),
            reasoning=suggestion_data.get('reasoning', ''),
            based_on_kb_articles=suggestion_data.get('based_on_kb_articles', []),
            model_used=suggestion_data.get('model_used'),
            generation_time_ms=suggestion_data.get('generation_time_ms')
        )
        
        db.add(suggestion)
        db.flush()
        
        result.append({
            "id": suggestion.id,
            "response_text": suggestion.response_text,
            "response_type": suggestion.response_type,
            "confidence_score": suggestion.confidence_score,
            "reasoning": suggestion.reasoning,
            "based_on_kb_articles": suggestion.based_on_kb_articles
        })
    
    db.commit()
    
    return result

@router.post("/suggestions/{suggestion_id}/use")
def use_suggestion(
    suggestion_id: int,
    feedback: Dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark suggestion as used and collect feedback
    """
    
    suggestion = db.query(SuggestedResponse).filter(
        SuggestedResponse.id == suggestion_id
    ).first()
    
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    
    suggestion.used = True
    suggestion.used_at = datetime.utcnow()
    suggestion.modified_before_use = feedback.get('modified', False)
    suggestion.feedback_rating = feedback.get('rating')
    suggestion.feedback_comment = feedback.get('comment')
    
    db.commit()
    
    return {"message": "Feedback recorded successfully"}

@router.get("/refunds/{refund_id}/explanation")
def get_refund_explanation(
    refund_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-generated explanation for refund decision
    """
    
    refund_request = db.query(RefundRequest).filter(
        RefundRequest.id == refund_id
    ).first()
    
    if not refund_request:
        raise HTTPException(status_code=404, detail="Refund request not found")
    
    existing_explanation = db.query(RefundExplanation).filter(
        RefundExplanation.refund_request_id == refund_id
    ).first()
    
    if existing_explanation:
        return {
            "id": existing_explanation.id,
            "decision": existing_explanation.decision,
            "agent_explanation": existing_explanation.explanation,
            "customer_explanation": existing_explanation.customer_explanation,
            "reasoning_points": existing_explanation.reasoning_points,
            "policy_sections": existing_explanation.policy_sections,
            "next_steps": existing_explanation.next_steps,
            "confidence_score": existing_explanation.confidence_score,
            "cached": True
        }
    
    fraud_check = db.query(FraudCheck).filter(
        FraudCheck.refund_request_id == refund_id
    ).first()
    
    explanation_data = copilot_service.generate_refund_explanation(
        refund_request, fraud_check, db
    )
    
    explanation = RefundExplanation(
        refund_request_id=refund_id,
        explanation=explanation_data.get('agent_explanation', ''),
        decision=explanation_data.get('decision', 'NEEDS_REVIEW'),
        reasoning_points=explanation_data.get('reasoning_points', []),
        policy_sections=explanation_data.get('policy_references', []),
        customer_explanation=explanation_data.get('customer_explanation', ''),
        next_steps=explanation_data.get('next_steps', []),
        model_used=explanation_data.get('model_used'),
        confidence_score=explanation_data.get('confidence_score')
    )
    
    db.add(explanation)
    db.commit()
    db.refresh(explanation)
    
    return {
        "id": explanation.id,
        "decision": explanation.decision,
        "agent_explanation": explanation.explanation,
        "customer_explanation": explanation.customer_explanation,
        "reasoning_points": explanation.reasoning_points,
        "policy_sections": explanation.policy_sections,
        "next_steps": explanation.next_steps,
        "confidence_score": explanation.confidence_score,
        "cached": False
    }

@router.get("/knowledge-base/search")
def search_knowledge_base(
    query: str,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search knowledge base documents
    """
    
    results = copilot_service.kb.search_documents(query)
    
    if category:
        results = [r for r in results if r['category'] == category]
    
    return {
        "query": query,
        "results": [{
            "title": doc['title'],
            "category": doc['category'],
            "subcategory": doc['subcategory'],
            "excerpt": doc['content'][:200] + "...",
            "relevance_score": doc.get('relevance_score', 0),
            "tags": doc['tags']
        } for doc in results[:10]]
    }

@router.get("/knowledge-base/categories")
def get_knowledge_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all knowledge base categories
    """
    
    categories = {}
    for doc in copilot_service.kb.documents:
        category = doc['category']
        if category not in categories:
            categories[category] = 0
        categories[category] += 1
    
    return {
        "categories": [
            {"name": cat, "count": count} 
            for cat, count in categories.items()
        ],
        "total_documents": len(copilot_service.kb.documents)
    }


# Supervisor-Specific Copilot Features

@router.get("/supervisor/team-insights")
def get_team_insights(
    time_range: str = "7d",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate AI-powered team performance insights for supervisors
    Analyzes agent performance, ticket trends, and provides recommendations
    """
    
    # Calculate time range
    if time_range == "24h":
        start_date = datetime.utcnow() - timedelta(hours=24)
        period_name = "last 24 hours"
    elif time_range == "7d":
        start_date = datetime.utcnow() - timedelta(days=7)
        period_name = "last 7 days"
    elif time_range == "30d":
        start_date = datetime.utcnow() - timedelta(days=30)
        period_name = "last 30 days"
    else:
        start_date = datetime.utcnow() - timedelta(days=7)
        period_name = "last 7 days"
    
    # Get all agents
    agents = db.query(User).join(Agent).filter(User.role == "AGENT").all()
    
    # Collect team statistics
    team_stats = []
    total_tickets = 0
    total_resolved = 0
    
    for agent_user in agents:
        agent_tickets = db.query(Ticket).filter(
            Ticket.agent_id == agent_user.id,
            Ticket.created_at >= start_date
        ).all()
        
        resolved_tickets = [t for t in agent_tickets if t.status in [TicketStatus.RESOLVED, TicketStatus.CLOSED]]
        avg_resolution_time = 0
        
        if resolved_tickets:
            resolution_times = []
            for ticket in resolved_tickets:
                if ticket.updated_at and ticket.created_at:
                    time_diff = (ticket.updated_at - ticket.created_at).total_seconds() / 3600
                    resolution_times.append(time_diff)
            
            if resolution_times:
                avg_resolution_time = sum(resolution_times) / len(resolution_times)
        
        team_stats.append({
            "agent_name": agent_user.full_name,
            "agent_id": agent_user.id,
            "tickets_handled": len(agent_tickets),
            "tickets_resolved": len(resolved_tickets),
            "avg_resolution_hours": round(avg_resolution_time, 2),
            "resolution_rate": round(len(resolved_tickets) / len(agent_tickets) * 100, 1) if agent_tickets else 0
        })
        
        total_tickets += len(agent_tickets)
        total_resolved += len(resolved_tickets)
    
    # Get ticket trends
    all_tickets = db.query(Ticket).filter(Ticket.created_at >= start_date).all()
    ticket_categories = {}
    priority_distribution = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
    
    for ticket in all_tickets:
        # Count priorities
        priority = ticket.priority.value if hasattr(ticket.priority, 'value') else str(ticket.priority)
        if priority in priority_distribution:
            priority_distribution[priority] += 1
    
    # Generate AI insights
    system_prompt = """You are a customer support operations analyst. 
Analyze team performance data and provide actionable insights for supervisors."""
    
    prompt = f"""Analyze this customer support team's performance over the {period_name}.

Team Statistics:
- Total Agents: {len(agents)}
- Total Tickets Handled: {total_tickets}
- Total Tickets Resolved: {total_resolved}
- Overall Resolution Rate: {round(total_resolved / total_tickets * 100, 1) if total_tickets > 0 else 0}%

Agent Performance:
{chr(10).join([f"- {a['agent_name']}: {a['tickets_handled']} tickets, {a['tickets_resolved']} resolved ({a['resolution_rate']}%), avg {a['avg_resolution_hours']}h resolution time" for a in team_stats])}

Priority Distribution:
- High Priority: {priority_distribution['HIGH']} tickets
- Medium Priority: {priority_distribution['MEDIUM']} tickets
- Low Priority: {priority_distribution['LOW']} tickets

Provide a JSON response with:
1. overall_assessment: Brief 2-3 sentence summary of team performance
2. top_performers: Array of top 3 agent names with brief reason
3. areas_for_improvement: Array of 3-5 specific improvement areas
4. recommendations: Array of 3-5 actionable recommendations for the supervisor
5. trends: Array of 2-3 observed trends (positive or negative)
6. workload_balance: Assessment of workload distribution (BALANCED, UNBALANCED, or NEEDS_ATTENTION)

Format as valid JSON only."""

    result = copilot_service.llm.generate(
        prompt=prompt,
        system_prompt=system_prompt,
        temperature=0.4,
        max_tokens=1200
    )
    
    if not result['success']:
        insights = {
            "overall_assessment": f"Team handled {total_tickets} tickets with {round(total_resolved / total_tickets * 100, 1) if total_tickets > 0 else 0}% resolution rate over the {period_name}.",
            "top_performers": [a['agent_name'] for a in sorted(team_stats, key=lambda x: x['resolution_rate'], reverse=True)[:3]],
            "areas_for_improvement": ["Monitor ticket resolution times", "Balance workload distribution"],
            "recommendations": ["Review agent training needs", "Optimize ticket assignment"],
            "trends": ["Ticket volume stable"],
            "workload_balance": "NEEDS_ATTENTION"
        }
    else:
        try:
            insights = json.loads(result['text'])
        except:
            insights = {
                "overall_assessment": result['text'][:300],
                "top_performers": [a['agent_name'] for a in sorted(team_stats, key=lambda x: x['resolution_rate'], reverse=True)[:3]],
                "areas_for_improvement": ["Review team performance"],
                "recommendations": ["Continue monitoring"],
                "trends": ["Analysis in progress"],
                "workload_balance": "NEEDS_ATTENTION"
            }
    
    return {
        "time_range": time_range,
        "period_name": period_name,
        "team_statistics": {
            "total_agents": len(agents),
            "total_tickets": total_tickets,
            "total_resolved": total_resolved,
            "resolution_rate": round(total_resolved / total_tickets * 100, 1) if total_tickets > 0 else 0,
            "priority_distribution": priority_distribution
        },
        "agent_performance": team_stats,
        "ai_insights": insights,
        "model_used": result.get('model', 'fallback'),
        "generated_at": datetime.utcnow()
    }

@router.get("/supervisor/agent-performance/{agent_id}")
def get_agent_performance_analysis(
    agent_id: int,
    time_range: str = "30d",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed AI analysis of individual agent performance
    """
    
    agent_user = db.query(User).filter(User.id == agent_id, User.role == "AGENT").first()
    if not agent_user:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Calculate time range
    if time_range == "7d":
        start_date = datetime.utcnow() - timedelta(days=7)
    elif time_range == "30d":
        start_date = datetime.utcnow() - timedelta(days=30)
    elif time_range == "90d":
        start_date = datetime.utcnow() - timedelta(days=90)
    else:
        start_date = datetime.utcnow() - timedelta(days=30)
    
    # Get agent's tickets
    agent_tickets = db.query(Ticket).filter(
        Ticket.agent_id == agent_id,
        Ticket.created_at >= start_date
    ).all()
    
    if not agent_tickets:
        return {
            "agent_name": agent_user.full_name,
            "message": "No tickets found for this agent in the selected time range"
        }
    
    # Calculate metrics
    resolved_tickets = [t for t in agent_tickets if t.status in [TicketStatus.RESOLVED, TicketStatus.CLOSED]]
    resolution_times = []
    
    for ticket in resolved_tickets:
        if ticket.updated_at and ticket.created_at:
            time_diff = (ticket.updated_at - ticket.created_at).total_seconds() / 3600
            resolution_times.append(time_diff)
    
    avg_resolution_time = sum(resolution_times) / len(resolution_times) if resolution_times else 0
    
    # Get customer feedback (from ticket summaries)
    summaries = db.query(TicketSummary).join(Ticket).filter(
        Ticket.agent_id == agent_id,
        Ticket.created_at >= start_date
    ).all()
    
    positive_sentiment = len([s for s in summaries if s.customer_sentiment == "POSITIVE"])
    negative_sentiment = len([s for s in summaries if s.customer_sentiment == "NEGATIVE"])
    
    system_prompt = """You are a performance coach for customer support agents.
Provide constructive, specific feedback based on performance data."""
    
    prompt = f"""Analyze this agent's performance and provide coaching feedback.

Agent: {agent_user.full_name}
Time Period: {time_range}

Performance Metrics:
- Total Tickets Handled: {len(agent_tickets)}
- Tickets Resolved: {len(resolved_tickets)}
- Resolution Rate: {round(len(resolved_tickets) / len(agent_tickets) * 100, 1)}%
- Average Resolution Time: {round(avg_resolution_time, 2)} hours
- Customer Sentiment: {positive_sentiment} positive, {negative_sentiment} negative

Provide JSON with:
1. performance_summary: 2-3 sentence overall assessment
2. strengths: Array of 3-4 specific strengths
3. improvement_areas: Array of 2-3 areas to improve
4. coaching_recommendations: Array of 3-4 specific, actionable coaching points
5. training_suggestions: Array of 2-3 training topics that would help
6. performance_trend: IMPROVING, STABLE, or DECLINING

Format as valid JSON."""

    result = copilot_service.llm.generate(
        prompt=prompt,
        system_prompt=system_prompt,
        temperature=0.5,
        max_tokens=1000
    )
    
    if result['success']:
        try:
            analysis = json.loads(result['text'])
        except:
            analysis = {
                "performance_summary": f"{agent_user.full_name} handled {len(agent_tickets)} tickets with {round(len(resolved_tickets) / len(agent_tickets) * 100, 1)}% resolution rate.",
                "strengths": ["Consistent ticket handling"],
                "improvement_areas": ["Resolution time optimization"],
                "coaching_recommendations": ["Continue current approach"],
                "training_suggestions": ["Advanced customer service techniques"],
                "performance_trend": "STABLE"
            }
    else:
        analysis = {
            "performance_summary": f"{agent_user.full_name} handled {len(agent_tickets)} tickets.",
            "strengths": ["Active ticket management"],
            "improvement_areas": ["Performance data being analyzed"],
            "coaching_recommendations": ["Regular check-ins recommended"],
            "training_suggestions": ["Standard training modules"],
            "performance_trend": "STABLE"
        }
    
    return {
        "agent_id": agent_id,
        "agent_name": agent_user.full_name,
        "time_range": time_range,
        "metrics": {
            "total_tickets": len(agent_tickets),
            "resolved_tickets": len(resolved_tickets),
            "resolution_rate": round(len(resolved_tickets) / len(agent_tickets) * 100, 1),
            "avg_resolution_hours": round(avg_resolution_time, 2),
            "positive_sentiment": positive_sentiment,
            "negative_sentiment": negative_sentiment
        },
        "ai_analysis": analysis,
        "model_used": result.get('model', 'fallback')
    }

@router.post("/supervisor/generate-report")
def generate_supervisor_report(
    report_config: Dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate comprehensive AI-powered report for supervisors
    """
    
    report_type = report_config.get('type', 'weekly')
    include_agents = report_config.get('include_agents', True)
    include_trends = report_config.get('include_trends', True)
    
    # Get time range based on report type
    if report_type == 'daily':
        start_date = datetime.utcnow() - timedelta(days=1)
        period = "Daily"
    elif report_type == 'weekly':
        start_date = datetime.utcnow() - timedelta(days=7)
        period = "Weekly"
    elif report_type == 'monthly':
        start_date = datetime.utcnow() - timedelta(days=30)
        period = "Monthly"
    else:
        start_date = datetime.utcnow() - timedelta(days=7)
        period = "Weekly"
    
    # Gather comprehensive data
    all_tickets = db.query(Ticket).filter(Ticket.created_at >= start_date).all()
    total_tickets = len(all_tickets)
    resolved_tickets = len([t for t in all_tickets if t.status in [TicketStatus.RESOLVED, TicketStatus.CLOSED]])
    
    # Agent summary
    agents = db.query(User).join(Agent).filter(User.role == "AGENT").all()
    agent_summary = []
    
    for agent_user in agents:
        agent_tickets = [t for t in all_tickets if t.agent_id == agent_user.id]
        agent_resolved = len([t for t in agent_tickets if t.status in [TicketStatus.RESOLVED, TicketStatus.CLOSED]])
        
        agent_summary.append({
            "name": agent_user.full_name,
            "handled": len(agent_tickets),
            "resolved": agent_resolved
        })
    
    system_prompt = """You are a business analyst creating executive summaries for customer support operations."""
    
    prompt = f"""Create a comprehensive {period} report for customer support operations.

Period: {period} Report
Total Tickets: {total_tickets}
Resolved Tickets: {resolved_tickets}
Resolution Rate: {round(resolved_tickets / total_tickets * 100, 1) if total_tickets > 0 else 0}%

Team: {len(agents)} agents
{chr(10).join([f"- {a['name']}: {a['handled']} handled, {a['resolved']} resolved" for a in agent_summary])}

Generate a professional report with:
1. executive_summary: 3-4 sentence high-level overview
2. key_metrics: Object with important numbers and their significance
3. highlights: Array of 3-5 positive achievements
4. challenges: Array of 2-3 challenges faced
5. action_items: Array of 3-5 recommended actions for next period
6. forecast: Brief prediction for next period

Format as valid JSON."""

    result = copilot_service.llm.generate(
        prompt=prompt,
        system_prompt=system_prompt,
        temperature=0.4,
        max_tokens=1500
    )
    
    if result['success']:
        try:
            report = json.loads(result['text'])
        except:
            report = {
                "executive_summary": f"{period} report: {total_tickets} tickets processed with {round(resolved_tickets / total_tickets * 100, 1) if total_tickets > 0 else 0}% resolution rate.",
                "key_metrics": {"total_tickets": total_tickets, "resolution_rate": f"{round(resolved_tickets / total_tickets * 100, 1) if total_tickets > 0 else 0}%"},
                "highlights": ["Team maintained operations"],
                "challenges": ["Standard operational challenges"],
                "action_items": ["Continue monitoring performance"],
                "forecast": "Stable operations expected"
            }
    else:
        report = {
            "executive_summary": f"{period} operations summary.",
            "key_metrics": {"total_tickets": total_tickets},
            "highlights": ["Operations ongoing"],
            "challenges": ["Report generation in progress"],
            "action_items": ["Review detailed metrics"],
            "forecast": "Analysis pending"
        }
    
    return {
        "report_type": report_type,
        "period": period,
        "generated_at": datetime.utcnow(),
        "data_range": {
            "start": start_date,
            "end": datetime.utcnow()
        },
        "statistics": {
            "total_tickets": total_tickets,
            "resolved_tickets": resolved_tickets,
            "resolution_rate": round(resolved_tickets / total_tickets * 100, 1) if total_tickets > 0 else 0,
            "active_agents": len(agents)
        },
        "report": report,
        "model_used": result.get('model', 'fallback')
    }
