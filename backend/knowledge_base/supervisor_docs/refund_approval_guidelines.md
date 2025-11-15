---
title: Goodwill Approval Guidelines for Supervisors
portal: supervisor
effective_date: 2025-11-13
owner: customer_experience
tags: [supervisor, goodwill, exceptions, policy_override, customer_retention]
security_tier: confidential
intent: reference
canonical_source: /supervisor/goodwill_approval_guidelines.md
related_docs: [escalation_protocol.md, refund_reasoning_examples.md, /agent/templates_refund.md]
---

# Goodwill Approval Guidelines for Supervisors

## Purpose
Define when and how supervisors can approve refunds, compensation, or policy exceptions outside standard policy to maintain customer satisfaction and loyalty while preventing abuse [web:6][web:12][web:20].

---

## Guiding Principles

1. **Customer Lifetime Value (CLV)**: Prioritize retaining high-value customers.
2. **Fairness**: Apply goodwill consistently; avoid favoritism.
3. **Business Impact**: Weigh cost of refund vs. cost of losing customer.
4. **One-Time Courtesy**: Goodwill is exceptional, not habitual.
5. **Documentation**: Every exception must be documented with reasoning.

---

## Approval Authority Levels

| Refund Amount | Approval Required | Conditions |
|--------------|------------------|------------|
| **₹0-₹5,000** | Supervisor only | No higher approval needed |
| **₹5,001-₹15,000** | Supervisor + Operations Head | Email approval required |
| **₹15,001-₹50,000** | Operations Head + VP Customer Experience | Written justification + CLV analysis |
| **>₹50,000** | VP + CFO | Board review may be required |

---

## Scenarios for Goodwill Approval

### **1. Delivery Delay Causing Policy Lapse**

**Situation**: Customer wants to return product on day 9; policy allows 7 days, but delivery was delayed by 3 days due to courier issue.

**Decision**: **Approve** if courier delay documented.

**Reasoning**: Company failure, not customer's fault.

**Template**: `GOODWILL_REFUND` – "We apologize for the delivery delay. As a one-time courtesy, we've approved your return despite the window expiration."

**Tag**: `goodwill_delivery_delay=true`

---

### **2. Website/Listing Error**

**Situation**: Customer received product; claims "not as described." Review shows website had wrong product image or incorrect specifications.

**Decision**: **Approve** full refund + ₹500 apology credit.

**Reasoning**: Company error in product listing.

**Action**: Also flag listing for QA team to fix.

**Template**: `GOODWILL_REFUND` + apology for website error.

---

### **3. VIP Customer (High CLV)**

**Situation**: Customer with ₹50,000+ lifetime spend, no prior refunds, requests return on day 8 (1 day late).

**Decision**: **Approve** as one-time courtesy.

**Reasoning**: Retaining high-value customer; risk of churn is costly.

**Communication**: "We value your loyalty as a long-time customer. As a one-time exception, we've approved this request. Please note future returns must be within policy window."

**Tag**: `goodwill_vip=true`

---

### **4. Customer in Distress (Compassionate Exception)**

**Situation**: Customer missed return window due to hospitalization, bereavement, or family emergency.

**Decision**: **Approve** if proof provided (medical certificate, death certificate, etc.).

**Reasoning**: Compassionate business practice.

**Communication**: "We're sorry for your situation. We've made an exception to our policy given your circumstances."

**Tag**: `goodwill_compassion=true`

---

### **5. Size Chart Error (Fashion)**

**Situation**: Customer claims "size doesn't fit," but followed website size chart. Review shows size chart was incorrect.

**Decision**: **Approve** return + free exchange.

**Reasoning**: Company error in size guide.

**Action**: Flag size chart for correction.

---

### **6. Minor Policy Technicality**

**Situation**: Customer submitted return request at 11:55 PM on day 7; system logged it as day 8 due to timezone/processing delay.

**Decision**: **Approve** (technicality, not intentional delay).

**Reasoning**: Customer acted in good faith.

---

### **7. Partial Damage (Hybrid Refund)**

**Situation**: Customer received 5-piece kitchen set; 2 pieces damaged, 3 intact. Policy says "return entire set," but customer wants to keep intact pieces.

**Decision**: **Approve partial refund** for 2 damaged pieces (40% of total price).

**Reasoning**: Customer keeps usable items; we avoid return shipping cost.

---

## Scenarios to REJECT Goodwill

### **❌ Do NOT approve goodwill if:**

1. **Serial returner**: Customer has 3+ approved goodwill exceptions in past 6 months.
2. **Fraud indicators**: Fraud score >60, reused photos, suspicious pattern.
3. **Clear policy violation with no mitigating factors**: Customer admits they "changed their mind" but item is used/worn.
4. **Low CLV + abuse pattern**: New customer (1 order) requesting exception on day 15 (way beyond 7-day window).
5. **Vendor-managed product**: Goodwill requires vendor's cooperation; if vendor refuses, we cannot unilaterally approve.

---

## Goodwill Decision Framework

**Ask these 4 questions before approving:**

1. **Was there a company error?** (Delivery delay, listing error, system glitch) → **Approve**.
2. **Is the customer high-value?** (CLV >₹20,000, no prior refunds) → **Lean toward approval**.
3. **Is this a repeat pattern?** (3+ goodwill requests) → **Reject** (abuse).
4. **What's the business impact?** (Cost of refund vs. cost of losing customer + potential negative review) → **Calculate**.

**If 3 out of 4 favor approval** → Approve.  
**If 2 or fewer favor approval** → Reject (but offer alternative: exchange, store credit).

---

## Communication Templates

### **Goodwill Approval Template**
Dear {{customer_name}},

We've reviewed your request for Order ID {{order_id}}. While your case falls slightly outside our standard return policy, we recognize [specific reason: delivery delay / website error / your loyalty].

As a one-time courtesy, we've approved your refund of ₹{{amount}}.

Please note that future returns must adhere to our published policy timelines to qualify. We appreciate your understanding.

The refund will be processed within 3-5 business days.

Thank you for being a valued Intellica customer.

Best regards,
Intellica Customer Experience Team


---

### **Goodwill Rejection (But Offer Alternative) Template**
Dear {{customer_name}},

We've carefully reviewed your request for Order ID {{order_id}}. Unfortunately, we're unable to approve a full refund as your request was submitted [X days] after our policy window.

However, as a gesture of goodwill, we'd like to offer you:

Option 1: Store credit of ₹{{amount}} (70% of purchase price) valid for 90 days.
Option 2: Exchange for a different product of equal or lesser value.
Option 3: ₹{{discount}} discount on your next order.

Please reply within 48 hours to select your preferred option.

We value your business and hope this helps resolve the matter fairly.

Best regards,
Intellica Support Team


---

## Monitoring & Abuse Prevention

**Monthly Goodwill Report (submitted to VP Customer Experience):**
- Total goodwill approvals: Count + ₹ amount.
- Breakdown by reason (delivery delay, VIP, compassion, etc.).
- Repeat goodwill recipients (flag accounts with 2+ approvals).
- Cost-benefit analysis (goodwill cost vs. estimated customer retention value).

**Red Flags:**
- Same customer receives goodwill 3+ times → Account review required.
- Supervisor approves >50% of escalations as goodwill → Calibration needed (may be too lenient).
- Goodwill cost exceeds 2% of refund budget → Tighten approval criteria.

**Quarterly Audit:**
- Random sample of 20 goodwill cases reviewed by Operations Head.
- Check: Was approval justified? Was documentation complete?
- Feedback to supervisors on consistency and judgment.

---

