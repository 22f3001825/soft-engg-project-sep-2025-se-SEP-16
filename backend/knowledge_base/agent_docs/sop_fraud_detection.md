---
title: SOP – Fraud Detection & Prevention
audience: agent
portal: agent
version: 2.1
effective_date: 2025-11-13
owner: compliance_team
tags: [agent, fraud, anomaly, refund, policy, risk_management]
security_tier: confidential
intent: procedural
canonical_source: /agent/sop_fraud_detection.md
related_docs: [escalation_rules.md, sop_refund_approval.md, ai_ethics/bias_detection.md]
---

# SOP – Fraud Detection & Anomaly Reporting

## Purpose
Identify, flag, and prevent fraudulent refund claims while maintaining fairness and avoiding false positives.

---

## Fraud Indicators (Red Flags)

### **Customer-Level Patterns**
- Same customer requests **3+ refunds** in 30 days on similar product categories.
- **High refund-to-purchase ratio** (>40% of orders refunded).
- Multiple accounts from **same IP address, device fingerprint, or shipping address**.
- Refund requests consistently filed on **day 6-7** of return window (gaming the system).

### **Evidence Manipulation**
- **Reused or edited damage photos** (detected via image hashing/reverse image search).
- Stock photos from product listings submitted as "damage proof."
- **Metadata anomalies**: Photo timestamp predates order delivery date.
- AI flags **photo tampering** (brightness/contrast manipulation, cropping artifacts).

### **Transaction Anomalies**
- **High-value orders** (>₹20,000) from new accounts with <30 days history.
- Same payment method linked to **multiple flagged accounts**.
- Rapid succession orders → Immediate refund requests (within 24-48 hours).
- **Address discrepancies**: Billing address ≠ shipping address, no prior delivery history.

### **Vendor Collusion Signals**
- Same vendor has **repeated refund claims** from unrelated customers.
- Vendor approves QC too quickly (<1 hour) on high-value items.
- Pattern of "defective" products from single vendor SKU.

---

## Agent Responsibilities

### **Step 1: Flag Suspicious Tickets**
If **2+ red flags** present:
1. Update ticket category → `FRAUD_REVIEW`.
2. Do NOT process refund or communicate decision to customer yet.
3. Tag ticket with fraud indicator codes (see table below).

### **Step 2: Document Reasoning**
In "Fraud Reasoning" field, provide:
- **Specific red flags observed** (quote from list above).
- **Fraud Engine risk score** (auto-populated if available).
- **Customer history summary**: Total orders, refunds, account age.
- **Agent's risk assessment**: Low / Medium / High.

**Example:**
Red Flags: (1) Customer has 4 refunds in 30 days, all Electronics category. (2) Photo submitted matches stock image on vendor website (hash: ABC123). (3) Fraud Engine score: 78/100 (High Risk).
Recommendation: Escalate for compliance review. Do not approve refund.


### **Step 3: Escalate to Supervisor**
- Use escalation code `E02_FRAUD_SUSPICION` (see `escalation_rules.md`).
- Attach Fraud Engine report, customer history export, evidence files.
- Notify supervisor via ticket system + Slack `#fraud-alerts` channel.

---

## AI-Powered Fraud Engine

**Intellica's Fraud Engine** automatically cross-references:

1. **Customer Historical Data**
   - Refund frequency, order patterns, account age.
   - Previous fraud flags or warnings.

2. **Image Verification**
   - Reverse image search against stock photo databases.
   - Perceptual hashing to detect reused images.
   - EXIF metadata analysis (camera model, GPS, timestamp).

3. **Transaction Logs**
   - Payment method linkage across accounts.
   - IP/device fingerprinting.
   - Shipping address clustering.

4. **Vendor Transaction Logs**
   - Vendor-specific refund rates.
   - Product defect rates by SKU.
   - Vendor QC approval speed anomalies.

**Risk Score Interpretation:**

| Score Range | Risk Level | Action |
|------------|-----------|--------|
| 0-30 | **Low** | Proceed with standard refund process |
| 31-60 | **Medium** | Manual review by agent; supervisor spot-check |
| 61-85 | **High** | Mandatory supervisor approval required |
| 86-100 | **Critical** | Auto-reject + escalate to Compliance |

---

## Fraud Indicator Codes

| Code | Description | Example |
|------|------------|---------|
| **F01** | Duplicate refund claim (same order) | Customer files 2 tickets for order #12345 |
| **F02** | Stock photo detected | Image hash matches vendor listing |
| **F03** | Multiple refunds (same customer) | 4+ refunds in 30 days |
| **F04** | Account linkage (multi-accounting) | Same device/IP across 3 accounts |
| **F05** | Metadata tampering | Photo taken before delivery date |
| **F06** | Vendor collusion suspected | Same vendor, 10+ "defective" claims in 7 days |
| **F07** | Payment fraud | Chargeback history or stolen card flag |
| **F08** | Behavioral anomaly | Refund request within 1 hour of delivery |

---

## Escalation Path & Decision Matrix

### **Agent → Supervisor (Level 1)**
- **When**: Fraud score 61-85 OR 2+ fraud indicators.
- **Timeline**: Supervisor reviews within 4 hours (P2 SLA).
- **Outcome**: Approve with conditions / Reject / Escalate to Compliance.

### **Supervisor → Compliance Team (Level 2)**
- **When**: Fraud score 86-100 OR vendor collusion OR multi-account fraud.
- **Timeline**: Compliance reviews within 24 hours.
- **Outcome**: 
  - **Account suspension** (temporary/permanent).
  - **Refund denial** with detailed reasoning.
  - **Legal action** (if fraud value >₹50,000).
  - **Vendor investigation** (if collusion confirmed).

### **Compliance → Law Enforcement (Level 3)**
- **When**: Organized fraud ring OR fraud value >₹1,00,000.
- **Timeline**: Case filed within 7 days.

---

## Customer Communication During Fraud Review

**DO:**
- Keep communication neutral: "Your case requires additional verification. We will update you within 24-48 hours."
- Do NOT accuse customer of fraud directly.
- Request additional evidence if legitimacy uncertain.

**DO NOT:**
- Share fraud score or internal investigation details.
- Process refund while case is under fraud review.
- Engage in confrontational language.

**Template for Fraud Hold:**
Dear {{customer_name}},

Your refund request for Order ID {{order_id}} is under additional verification to ensure policy compliance.

We will update you within 24-48 hours. If you have additional evidence (photos, videos, purchase receipts), please submit them to expedite the review.

Thank you for your patience.

Intellica Verification Team


---

## False Positive Mitigation

**Bias & Fairness Checks** (see `ai_ethics/bias_detection.md`):
- Monthly audit: Ensure fraud flags don't disproportionately target specific demographics (region, payment method, new customers).
- Human override: Supervisors can approve refunds despite high fraud score if evidence is legitimate.
- Customer appeal process: Flagged customers can submit counter-evidence within 48 hours.

**Scenario: Legitimate Customer Flagged**
- If supervisor determines fraud flag was false positive:
  - Approve refund immediately.
  - Add note to customer profile: "Cleared fraud review [date]."
  - Report case to AI team for model retraining.
  - Offer goodwill gesture (discount code) for inconvenience.

---

## Key Metrics & Monitoring

- **Fraud Detection Rate**: % of flagged cases confirmed as fraud.
- **False Positive Rate**: < 10% (flagged but legitimate).
- **Average Investigation Time**: < 24 hours for P2 fraud cases.
- **Fraud Loss Prevention**: Total ₹ saved by blocking fraudulent refunds.

**Monthly Review:**
- Compliance team analyzes fraud trends (new schemes, emerging patterns).
- Update fraud indicators and AI model thresholds.
- Share anonymized case studies with agents for training.

---

## Case Examples

### **Example 1: Auto-Reject (Stock Photo)**

| Field | Value |
|-------|-------|
| **Order ID** | #67890 |
| **Issue** | Customer claims phone screen cracked during shipping |
| **Evidence** | Photo submitted |
| **Fraud Engine Finding** | Image hash matches stock photo from Google Images |
| **Action** | Auto-reject with code `F02_STOCK_PHOTO`. Template: `REFUND_REJECTED_EVIDENCE` |

---

### **Example 2: Escalate (High Refund Rate)**

| Field | Value |
|-------|-------|
| **Customer** | John Doe (Account #456) |
| **Pattern** | 5 refunds in 20 days, all headphones, different vendors |
| **Fraud Score** | 72/100 (High) |
| **Action** | Flag `F03_MULTIPLE_REFUNDS`. Escalate to supervisor. Supervisor investigates: Finds customer runs electronics repair shop, purchases bulk for testing. **Outcome**: Approved after verification of business purpose. |

---

### **Example 3: Vendor Collusion**

| Field | Value |
|-------|-------|
| **Vendor** | TechGadgets Inc. |
| **Pattern** | 12 "defective smartphone" claims in 7 days, all different customers, vendor approves all within 1 hour |
| **Action** | Flag `F06_VENDOR_COLLUSION`. Escalate to Compliance. Investigation reveals vendor and customers are coordinated fraud ring. **Outcome**: Vendor account suspended, law enforcement notified, all refunds reversed. |

---


