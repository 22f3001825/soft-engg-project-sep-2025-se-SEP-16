---
title: Escalation Rules & Priority Guidelines
portal: agent
effective_date: 2025-11-13
owner: support_operations
tags: [agent, escalation, sla, priority, workflow]
security_tier: internal
intent: reference
canonical_source: /agent/escalation_rules.md
related_docs: [sop_escalation.md, sop_refund_approval.md, sop_fraud_detection.md]
---

# Escalation Rules for Support Agents

## Priority Levels & SLA

| Priority | Description | SLA Target | Escalation Trigger |
|----------|-------------|------------|-------------------|
| **P1 (CRITICAL)** | Payment gateway down, bulk order failures, data breach | **1 hour** | Immediate supervisor + ops manager notification |
| **P2 (HIGH)** | Refund > ₹10,000, fraud claim, vendor dispute | **4 hours** | Supervisor review required |
| **P3 (MEDIUM)** | Customer dissatisfaction after 2 replies, policy ambiguity | **24 hours** | Supervisor optional; agent can resolve with guidance |
| **P4 (LOW)** | General query, FAQ, status check | **48 hours** | Self-service or agent resolution |

---

## Escalation Reason Codes

| Code | Reason | Required Artifacts | Next Level |
|------|--------|-------------------|-----------|
| **E01** | High-value refund (> ₹10,000) | Order details, refund calculation, evidence | Supervisor → Finance |
| **E02** | Fraud suspicion | Fraud Engine report, customer history, duplicate claim analysis | Supervisor → Compliance |
| **E03** | Policy ambiguity / edge case | Policy excerpt, similar past cases, agent reasoning | Supervisor → Policy Team |
| **E04** | Vendor non-compliance | Vendor SLA log, communication trail, product details | Supervisor → Vendor Relations |
| **E05** | Customer escalation request | Full chat transcript, previous resolution attempts | Supervisor |
| **E06** | Technical/system issue | Error logs, screenshots, impacted order IDs | Supervisor → Engineering |

---

## Escalation Steps (Standard Flow)

### **Step 1: Pre-Escalation Checklist**
Before escalating, ensure:
- [ ] Ticket fully documented (order ID, customer name, issue summary).
- [ ] Evidence attached (photos, chat logs, AI reports).
- [ ] Agent recommendation provided (approve/reject/needs review).
- [ ] Customer informed of escalation: "Your case requires senior review. Expect update within [SLA]."

### **Step 2: Log Escalation**
1. Update ticket status → `ESCALATED`.
2. Assign escalation code (E01-E06).
3. Tag supervisor in system with `@supervisor_team`.
4. Attach summary document with:
   - Ticket ID, order ID, customer contact.
   - Issue description (2-3 sentences).
   - Evidence links.
   - Agent's recommended action + reasoning.

### **Step 3: Handoff**
- Notify supervisor via Slack/email with ticket link.
- Set ticket SLA timer to escalation target (see table above).
- Monitor for supervisor response; if no action within SLA → ping again.

### **Step 4: Follow-Up**
- Once supervisor makes decision, update customer immediately.
- Record supervisor's decision + rationale in ticket notes.
- If case re-escalates to Level 3 (Compliance/Management) → supervisor handles; agent monitors only.

---

## Special Escalation Scenarios

### **Scenario: Vendor Unresponsive**
- If vendor doesn't respond to QC request within 48 hours:
  - Code: `E04_VENDOR_NO_RESPONSE`.
  - Escalate to Vendor Relations team.
  - Supervisor can approve refund if AI confidence ≥ 70% + manual review confirms damage.

### **Scenario: Customer Threatens Legal Action**
- Immediate escalation: Code `E07_LEGAL_THREAT`.
- Notify supervisor + compliance team within 1 hour.
- Do NOT engage further; let legal/compliance handle communication.
- Document exact customer statement (quote verbatim).

### **Scenario: Repeat Escalator (Customer)**
- If same customer escalates 3+ tickets in 30 days:
  - Flag account for supervisor review.
  - Check for patterns (legitimate issues vs. abuse).
  - Supervisor may assign dedicated agent or apply account restrictions.

### **Scenario: AI Tool Failure**
- If AI Damage Tool or Fraud Engine is down:
  - Code: `E06_SYSTEM_OUTAGE`.
  - Escalate all affected tickets to supervisor for manual review.
  - Log incident in #engineering-alerts Slack channel.
  - Notify customers of delay: "Our verification system is under maintenance. Your case will be reviewed manually within [extended SLA]."

---

## Escalation Performance Metrics

- **Healthy Escalation Rate**: 10-15% of total tickets.
- **Unnecessary Escalations**: < 5% (flagged during QA audits).
- **Escalation Resolution Time**: 
  - P1: < 1 hour
  - P2: < 4 hours
  - P3: < 24 hours

**Quality Impact:**
- Repeated unnecessary escalations affect agent QA score.
- Missing documentation delays resolution and impacts CSAT.

---

## Prohibited Escalation Practices

❌ **DO NOT escalate if:**
- Issue can be resolved using existing templates/SOPs.
- You haven't attempted standard troubleshooting steps.
- Missing required artifacts (order ID, evidence, reasoning).
- Customer simply asks to "speak to manager" without valid unresolved issue → Politely offer resolution first.

✅ **DO escalate when:**
- Policy unclear or contradictory.
- High financial/fraud risk.
- Customer dissatisfied after genuine resolution attempts.
- System errors blocking resolution.

---

