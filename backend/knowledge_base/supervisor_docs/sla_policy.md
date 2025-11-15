---
title: SLA Policy – Intellica Support Operations
portal: supervisor
effective_date: 2025-11-13
owner: operations_team
tags: [supervisor, sla, performance, compliance, metrics]
security_tier: internal
intent: policy
canonical_source: /supervisor/sla_policy.md
related_docs: [escalation_protocol.md, agent_evaluation_criteria.md, team_summary_report.md]
---

# Service Level Agreement (SLA) Policy

## Objective
Ensure consistent, high-quality response and resolution times across all support tiers while maintaining customer satisfaction and operational efficiency [web:35][web:42].

---

## SLA Targets

| Priority | Description | First Response Time | Resolution Time | Escalation Trigger |
|----------|-------------|-------------------|----------------|-------------------|
| **P1 (CRITICAL)** | Payment gateway down, system-wide outages, data breach | **15 minutes** | **1 hour** | Auto-escalate to ops manager immediately |
| **P2 (HIGH)** | Fraud suspicion, refund >₹10,000, vendor dispute | **30 minutes** | **4 hours** | Supervisor review required |
| **P3 (MEDIUM)** | Standard refund/return requests, policy clarifications | **2 hours** | **24 hours** | Agent can resolve; supervisor spot-check |
| **P4 (LOW)** | General inquiries, order status checks, FAQs | **6 hours** | **48 hours** | Self-service priority; deflection encouraged |

### **Response Time** = Time from ticket creation to first agent/supervisor acknowledgment
### **Resolution Time** = Time from ticket creation to final customer-facing decision (approved/rejected/resolved)

---

## SLA Breach Handling

### **Automated Alerts**
- Supervisor receives **real-time alert** via Intellica Monitoring System at:
  - 75% of SLA elapsed (warning)
  - 90% of SLA elapsed (urgent)
  - 100%+ SLA breach (critical)

### **Supervisor Response Protocol**

**Step 1: Immediate Triage (within 15 minutes of breach alert)**
- Review ticket to identify blocker:
  - **Agent delay**: Reassign to available agent or take over ticket.
  - **System error**: Escalate to engineering; notify customer of delay.
  - **Vendor hold**: Contact vendor directly; if no response in 2 hours, approve based on evidence.
  - **Missing customer info**: Use template `REQUEST_FOR_INFORMATION`; pause SLA clock.

**Step 2: Mitigation Actions**
- If agent-caused: Provide immediate coaching; log in agent performance file.
- If system-caused: File incident report; extend customer SLA with compensation (discount/credit).
- If vendor-caused: Escalate to Vendor Relations; may bypass vendor for approval.

**Step 3: Documentation**
- Log breach reason in ticket notes.
- Update escalation summary with mitigation steps taken.
- Tag ticket: `sla_breach=true` for analytics tracking.

---

## SLA Reporting

### **Weekly SLA Compliance Report** (Submitted to Operations Head every Monday)

**Required Metrics:**
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Overall SLA Compliance Rate** | ≥ 98% | [Calculate] | 🟢/🟡/🔴 |
| **P1 SLA Compliance** | 100% | [Calculate] | 🟢/🔴 |
| **P2 SLA Compliance** | ≥ 95% | [Calculate] | 🟢/🟡/🔴 |
| **P3 SLA Compliance** | ≥ 97% | [Calculate] | 🟢/🟡/🔴 |
| **P4 SLA Compliance** | ≥ 90% | [Calculate] | 🟢/🟡/🔴 |
| **Breach Count** | < 2% of total tickets | [Calculate] | 🟢/🟡/🔴 |

**Breach Analysis:**
- Break down by root cause (agent, system, vendor, customer).
- Identify repeat offenders (agents with >3 breaches/week).
- Recommend corrective actions (training, process changes, system fixes).

**Report Template:** See `team_summary_report.md`

---

## SLA Pause Conditions

**SLA clock pauses when:**
1. **Waiting for customer response** (ticket status = `WAITING_FOR_CUSTOMER`).
2. **Vendor QC in progress** (vendor has 48-hour SLA; separate timer).
3. **System outage confirmed by engineering** (documented incident).
4. **Legal/compliance hold** (rare; requires VP approval).

**SLA clock resumes when:**
- Customer responds.
- Vendor responds or vendor SLA expires.
- System restored.
- Compliance clears case.

---

## Escalation for Persistent SLA Breaches

### **Trigger Thresholds:**
- **Agent level**: >3 SLA breaches in one week → Mandatory coaching + performance improvement plan (PIP).
- **Team level**: <95% team SLA compliance for 2 consecutive weeks → Supervisor escalation to Operations Head.
- **System level**: >5% SLA breaches due to system issues → Engineering escalation + incident review.

### **Escalation Path:**
1. **Level 1**: Supervisor → Operations Head (weekly report + action plan).
2. **Level 2**: Operations Head → Compliance & QA Division (if systemic issues).
3. **Level 3**: Compliance → Executive Review (if customer complaints escalate or regulatory risk).

---

## SLA Exceptions (Goodwill Extensions)

**Supervisors may grant SLA extensions with customer compensation in these cases:**
- System outage >2 hours (offer 10% discount on next order).
- Vendor delay >48 hours (offer ₹200 goodwill credit).
- Agent error causing delay (personalized apology + priority handling).

**Approval Process:**
- Supervisor documents exception reason in ticket.
- Compensation auto-approved up to ₹500; >₹500 requires Operations Head sign-off.
- Customer notified: "We apologize for the delay. As a gesture of goodwill, we've applied [compensation]."

---

## Key Performance Indicators (KPIs) Tied to SLA

**Supervisor Dashboard Metrics:**
- **Average Response Time** (by priority level).
- **Average Resolution Time** (by priority level).
- **SLA Breach Rate** (% of tickets breaching SLA).
- **Customer Satisfaction (CSAT)** post-SLA breach (target: recover to >4.0/5).
- **Agent SLA Compliance Rate** (individual leaderboard).

**Monthly Review:**
- Identify top performers (agents with 100% SLA compliance).
- Recognize and reward in team meetings.
- Address underperformers with targeted coaching.

---

## SLA Policy Review & Updates

- Policy reviewed **quarterly** (every 3 months).
- SLA targets may be adjusted based on:
  - Customer feedback and CSAT trends.
  - System performance and tool upgrades.
  - Team capacity and hiring changes.
- All updates communicated via `#policy-updates` Slack channel + mandatory training.

---

