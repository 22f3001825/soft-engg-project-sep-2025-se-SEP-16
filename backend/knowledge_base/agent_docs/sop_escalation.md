---
title: SOP – Escalation Management
portal: agent
effective_date: 2025-11-13
owner: support_operations
tags: [agent, escalation, support, supervisor, workflow, sla]
security_tier: internal
intent: procedural
canonical_source: /agent/sop_escalation.md
related_docs: [escalation_rules.md, sop_refund_approval.md, sop_fraud_detection.md, tone_policy_agent.md]
---

# Escalation Management SOP

## Purpose
To maintain structured, transparent, and traceable escalation of unresolved or complex support tickets while ensuring accountability, timely resolution, and customer satisfaction [web:35][web:34].

---

## Escalation Triggers

### **Mandatory Escalation (Must escalate immediately)**
- Refund disputes **> ₹10,000** (see `escalation_rules.md` code E01).
- **Fraud suspicion** flagged by AI or agent (code E02).
- **Vendor non-compliance** (vendor unresponsive >48 hours or quality dispute, code E04).
- **Legal threats** or requests for legal team involvement (code E07).
- **System outages** impacting order processing or refunds (code E06).
- Customer explicitly requests **supervisor/manager escalation** (code E05).

### **Discretionary Escalation (Agent judgment required)**
- Customer dissatisfaction after **2 failed resolution attempts** (code E03).
- **Policy ambiguity** or edge cases not covered by standard SOPs (code E03).
- **AI confidence score 60-84%** requiring human review (code E03).
- **Vendor QC delay** beyond 48-hour SLA (code E04).
- **Sensitive account flags** (VIP customer, high lifetime value, previous escalations).

---

## Escalation Levels & SLA

### **Level 1: Agent → Supervisor**
**When**: Standard escalations (high-value refunds, policy ambiguity, customer requests).  
**SLA**: Supervisor must respond within **4 hours** (P2 tickets) or **24 hours** (P3 tickets).  
**Scope**: Supervisor reviews case, approves/rejects refund, or escalates further.

### **Level 2: Supervisor → Compliance Team**
**When**: Fraud cases, financial irregularities, vendor collusion, legal issues.  
**SLA**: Compliance reviews within **24 hours**.  
**Scope**: Investigate fraud patterns, coordinate with legal/finance, may suspend accounts or file reports.

### **Level 3: Compliance → Management Review Board**
**When**: Escalations involving **> ₹1,00,000** fraud, organized fraud rings, systemic vendor issues, regulatory violations.  
**SLA**: Board reviews within **7 days**.  
**Scope**: Strategic decisions, legal action, vendor contract termination, policy changes.

---

## Pre-Escalation Checklist

**Before escalating any ticket, agents MUST complete:**

- [ ] **Ticket fully documented**: Order ID, customer name, contact info, issue summary.
- [ ] **Evidence attached**: Photos, videos, chat logs, AI reports, fraud scores.
- [ ] **Policy verification completed**: Checked relevant category return policy, SOP refund approval.
- [ ] **Agent recommendation provided**: Clear statement (approve/reject/needs review) with reasoning.
- [ ] **Customer informed**: "Your case requires senior review. You'll hear from us within [SLA timeframe]."
- [ ] **Escalation code assigned**: E01-E07 (see `escalation_rules.md`).

**Failure to complete checklist may result in escalation rejection and ticket returned to agent.**

---

## Escalation Flow & Handoff Procedure

### **Step 1: Agent Initiates Escalation**

1. **Update ticket status** → `ESCALATED`.
2. **Assign escalation reason code** (E01-E07).
3. **Fill escalation form** with:
   - Ticket ID and Order ID.
   - Customer name, email, phone.
   - Brief issue summary (2-3 sentences).
   - Evidence file links (attach or reference by file ID).
   - Agent's **recommended action** + reasoning.
   - Category return policy clause (if applicable).
   - Fraud score or AI confidence score (if applicable).

4. **Tag supervisor** in ticketing system: `@supervisor_team`.
5. **Notify via Slack** in `#escalations` channel with ticket link.
6. **Communicate with customer**:
   - Template: "Your case has been escalated to our senior support team for detailed review. You'll receive an update within [4 hours/24 hours] depending on priority."

---

### **Step 2: Supervisor Reviews & Decides**

**Supervisor Actions:**
- Review all evidence, agent notes, policy alignment.
- Check customer history (past refunds, fraud flags, account age).
- Consult `escalation_rules.md` for decision matrix.
- Make one of three decisions:
  - **Approve** → Process refund, close ticket, notify customer using approved template.
  - **Reject** → Deny refund, provide detailed reasoning, notify customer with rejection template.
  - **Escalate to Level 2** → Send to Compliance with additional context.

**Supervisor Response SLA:**
- P1 (Critical): 1 hour.
- P2 (High): 4 hours.
- P3 (Medium): 24 hours.

**Documentation Required:**
- Supervisor decision recorded in ticket notes.
- Reason code logged (R01-R03, E01-E07).
- Customer notification sent within 1 hour of decision.

---

### **Step 3: Compliance Team Review (Level 2)**

**Triggered when:**
- Fraud score > 85 (critical fraud risk).
- Multiple linked accounts detected.
- Vendor collusion suspected.
- Legal or financial irregularities.

**Compliance Actions:**
- Conduct deep investigation (cross-reference databases, vendor records).
- Coordinate with finance/legal teams if needed.
- Decide on:
  - Account suspension (temporary/permanent).
  - Refund denial with fraud documentation.
  - Vendor investigation or contract review.
  - Law enforcement referral (if fraud > ₹50,000).

**SLA**: 24 hours for initial assessment; 7 days for full investigation.

---

### **Step 4: Management Review Board (Level 3)**

**Rare cases only:**
- Fraud exceeding ₹1,00,000.
- Organized fraud rings.
- Vendor contract disputes affecting multiple customers.
- Regulatory compliance violations.

**Process:**
- Compliance prepares full case report.
- Board reviews within 7 days.
- Final decision is binding (no further escalation).

---

## Documentation Requirements

**Every escalation must include:**

1. **Case Summary**:
   - What happened (customer complaint, refund request reason).
   - What agent did (checked policy, ran AI verification, contacted vendor).
   - Why escalation is needed (policy gap, high value, fraud suspicion).

2. **Evidence Files**:
   - Customer-submitted photos/videos.
   - AI Damage Verification report (with confidence score).
   - Fraud Engine report (if applicable).
   - Chat/email transcripts.
   - Vendor communication logs (if vendor-related).

3. **Agent Recommendation**:
   - Clear position: "I recommend approval because..." or "I recommend rejection because...".
   - Policy citation if applicable.

4. **Customer History Overview**:
   - Account age, total orders, previous refunds.
   - Any fraud flags or warnings.
   - Lifetime value (if VIP customer).

---

## Customer Communication During Escalation

### **Initial Escalation Notification** (Required)
Template:
Dear {{customer_name}},

Your refund request for Order ID {{order_id}} has been escalated to our senior support team for thorough review.
Reason for escalation: {{escalation_reason}} (e.g., high-value refund, additional verification required, policy review needed).
Expected timeline: You will receive an update within {{sla_timeframe}} hours.
No further action is needed from you at this time. If we require additional information, we will reach out directly.

Thank you for your patience.
Intellica Support Team


### **Post-Decision Communication** (Required within 1 hour of decision)
- **If approved**: Use `REFUND_APPROVED` template (see `templates_refund.md`).
- **If rejected**: Use appropriate rejection template with clear reasoning and policy citation.
- **If further escalated**: "Your case is now under compliance review. We will update you within 24 hours."

---

## Escalation Performance Metrics

**Healthy Thresholds:**
- **Escalation rate**: 10-15% of total tickets.
- **Unnecessary escalation rate**: < 5% (flagged during supervisor review).
- **SLA compliance**: > 95% of escalations resolved within SLA.
- **Customer satisfaction post-escalation**: > 4.0/5.

**Agent Quality Impact:**
- **Proper escalations** (with complete documentation, valid reasoning) → Positive QA score.
- **Unnecessary escalations** (could have been resolved by agent) → Negative QA score, coaching required.
- **Missing documentation** → Escalation rejected, ticket returned, delays customer resolution.

---

## Special Escalation Scenarios

### **Scenario 1: Vendor Unresponsive Beyond SLA**
- Vendor has 48 hours to respond to QC requests.
- If no response: Code `E04_VENDOR_NO_RESPONSE`.
- Supervisor may approve refund if AI confidence ≥ 70% + evidence is clear.
- Vendor Relations team notified for contract review.

### **Scenario 2: Customer Threatens Legal Action**
- Immediate escalation: Code `E07_LEGAL_THREAT`.
- Notify supervisor + compliance within 1 hour.
- **Do NOT engage** in legal discussion with customer.
- Let compliance/legal team handle all further communication.
- Document customer's exact statement (quote verbatim).

### **Scenario 3: AI/System Tool Failure**
- If AI Damage Tool, Fraud Engine, or refund processing system is down:
  - Code `E06_SYSTEM_OUTAGE`.
  - Escalate ALL affected tickets to supervisor for manual review.
  - Post alert in `#engineering-alerts` Slack channel.
  - Notify customers: "Our verification system is undergoing maintenance. Your case will be manually reviewed within [extended SLA]."

### **Scenario 4: Repeat Escalator (Same Customer)**
- If customer escalates 3+ tickets in 30 days:
  - Flag account for supervisor review.
  - Check for patterns: Legitimate issues? Policy abuse?
  - Supervisor may assign dedicated agent or apply account monitoring.

---

## Prohibited Escalation Practices

**❌ DO NOT escalate if:**
- Issue can be resolved using existing SOPs/templates.
- You haven't checked the relevant category return policy.
- Documentation is incomplete (missing evidence, no recommendation).
- Customer simply asks to "speak to manager" without unresolved issue → Offer resolution first; escalate only if genuinely stuck.

**✅ DO escalate when:**
- Policy is unclear or contradictory.
- Refund amount exceeds agent approval threshold.
- Fraud or security risk detected.
- Vendor unresponsive or disputes valid claim.
- Customer dissatisfied after genuine resolution attempts (2+ interactions).

---

## Quality Assurance & Auditing

- Supervisors review **10% of escalations weekly** for quality and necessity.
- Monthly calibration sessions to align agents on when to escalate.
- Escalations with missing documentation are **rejected and returned** to agent.
- Repeated unnecessary escalations trigger **coaching and retraining**.

---

## Escalation Code Reference (Quick Lookup)

| Code | Trigger | Next Level | SLA |
|------|---------|-----------|-----|
| **E01** | High-value refund (> ₹10,000) | Supervisor | 4 hours |
| **E02** | Fraud suspicion | Supervisor → Compliance | 24 hours |
| **E03** | Policy ambiguity / AI score 60-84% | Supervisor | 24 hours |
| **E04** | Vendor non-compliance | Supervisor → Vendor Relations | 48 hours |
| **E05** | Customer escalation request | Supervisor | 4 hours |
| **E06** | System/technical failure | Supervisor → Engineering | 4 hours |
| **E07** | Legal threat | Supervisor → Compliance → Legal | 1 hour |

*(Full details in `escalation_rules.md`)*

---

## Policy Review & Updates

- SOP reviewed quarterly.
- Escalation thresholds (₹10,000 limit, SLA times) may be adjusted based on operational data.
- Feedback from supervisors and agents incorporated via `#ops-feedback` channel.

---