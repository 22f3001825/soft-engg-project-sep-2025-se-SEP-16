title: SOP – Refund Approval Process
portal: agent
effective_date: 2025-11-13
owner: ops_team
review_cycle: quarterly
tags: [agent, refund, sop, approval, operations, decision_tree]
security_tier: internal
intent: procedural
canonical_source: /agent/sop_refund_approval.md
related_docs: [policy_electronics_returns.md, policy_food_returns.md, policy_apparel_returns.md, policy_home_returns.md, escalation_rules.md, templates_refund.md]
---

# Standard Operating Procedure – Refund Approval

## Objective
Ensure accurate, policy-compliant, and timely approval of refund requests across all product categories with full auditability.

---

## Procedure

### **Step 1: Ticket Review & Validation**
- Verify order ID exists in system (check Orders DB).
- Confirm customer identity matches order email/phone.
- Log ticket received timestamp for SLA tracking.
- **Required fields**: Order ID, Product SKU, Refund Reason, Evidence (photos/videos).

**Action**: If any field missing → Use template `REQUEST_FOR_INFORMATION` and set ticket to `WAITING_FOR_CUSTOMER`.

---

### **Step 2: Category-Specific Eligibility Check**

**Decision Matrix by Category:**

| Category | Return Window | Conditions | Non-Returnable Items | Policy Doc |
|----------|--------------|------------|---------------------|------------|
| **Electronics** | 10 days | Unopened box, seal intact, accessories complete | Earphones, chargers, opened software | `policy_electronics_returns.md` |
| **Food & Beverages** | 48 hours | Unopened, unexpired, temperature-verified | Opened/consumed items, custom cakes | `policy_food_returns.md` |
| **Fashion & Clothing** | 7 days | Unworn, unwashed, tags intact | Undergarments, socks, altered items | `policy_apparel_returns.md` |
| **Home & Garden** | 14 days | Unused, original packaging | Customized prints, used candles/diffusers | `policy_home_returns.md` |

**Check:**
1. Request date ≤ category return window from delivery date?
2. Product NOT in non-returnable list?
3. Return reason valid (defect/damage/wrong item/not as described)?

**Action**: 
- If **all YES** → Proceed to Step 3.
- If **any NO** → Record reason code `R02_POLICY_WINDOW_EXPIRED` or `R02_NON_RETURNABLE` → Use template `REFUND_REJECTED_POLICY` → Close ticket.

---

### **Step 3: Evidence Verification**

**Photo/Video Requirements:**
- Minimum 2 clear images: product damage + packaging/label.
- File formats: JPG, PNG, MP4 (max 10MB per file).
- No stock photos (AI hash verification runs automatically).

**AI Damage Verification Tool:**
- Upload evidence to AI Damage Scanner.
- Review confidence score and damage classification.

**Decision Tree:**
| AI Confidence | Damage Type | Action |
|--------------|------------|--------|
| ≥ 85% | Shipping damage, defect, wrong item | **Auto-approve** → Step 4 |
| 60-84% | Ambiguous/partial damage | **Manual review required** → Check with vendor photo guidelines → Escalate if unclear |
| < 60% | No visible damage / stock photo detected | **Reject** → Code `R02_INSUFFICIENT_EVIDENCE` → Template `REFUND_REJECTED_EVIDENCE` |

**Vendor-Specific Overrides:**
- If vendor has "Require Vendor QC" flag = YES → Always escalate to vendor portal regardless of AI score.
- Vendor response SLA: 48 hours.

**Action**: 
- If AI ≥ 85% AND no vendor QC flag → Approve directly (Step 4).
- If 60-84% OR vendor QC required → Escalate to supervisor with code `R03_VENDOR_REVIEW_NEEDED` (Step 5).
- If < 60% → Reject with template (Step 4).

---

### **Step 4: Decision & Communication**

**Approval Path:**
1. Update ticket status → `RESOLVED`.
2. Record reason code: `R01_APPROVED_POLICY_COMPLIANT` or `R01_APPROVED_AI_VERIFIED`.
3. Trigger refund in payment system (auto-creates refund ID).
4. Use template `REFUND_APPROVED` with variables: `{{customer_name}}`, `{{order_id}}`, `{{refund_amount}}`, `{{refund_timeline}}`.
5. Set ticket to auto-close after 48 hours if no customer response.

**Rejection Path:**
1. Update ticket status → `CLOSED`.
2. Record reason code from list below.
3. Use appropriate rejection template.
4. Offer alternative if applicable (exchange, store credit).

**Reason Codes (Rejection):**
- `R02_POLICY_WINDOW_EXPIRED` – Request after return window.
- `R02_NON_RETURNABLE` – Item in exclusion list.
- `R02_INSUFFICIENT_EVIDENCE` – Photos unclear/missing/stock images.
- `R02_CUSTOMER_DAMAGE` – AI detected user-inflicted damage.
- `R02_VENDOR_REJECTED` – Vendor QC failed (append vendor notes).

---

### **Step 5: Escalation Protocol**

**Escalate to Supervisor if:**
- Refund amount > ₹10,000 (see `escalation_rules.md`).
- AI confidence 60-84% (human review needed).
- Vendor QC required but vendor non-responsive after 48 hours.
- Customer disputes rejection (after 2+ agent replies).
- Suspected fraud flagged by Fraud Engine (see `sop_fraud_detection.md`).

**Escalation Requirements:**
1. Attach ticket summary, evidence files, AI report, agent recommendation.
2. Use escalation code from `escalation_rules.md` (E01-E04).
3. Tag supervisor in ticketing system.
4. Update customer: "Your case is under senior review. Expect update within [SLA]."

---

### **Step 6: Quality Control & Audit**

- Supervisors audit 10% of approved refunds weekly.
- Monthly calibration sessions for agents on borderline cases.
- All decisions logged with reasoning in `ticket_history` table.
- AI model performance tracked: If accuracy drops below 80%, retrain with new data.

---

## Key Performance Indicators (KPIs)
- **First Response Time**: < 4 hours for P2/P3 tickets.
- **Resolution Rate**: > 90% within SLA.
- **Escalation Rate**: < 15% of total tickets.
- **Customer Satisfaction (CSAT)**: > 4.2/5 post-resolution.

---

## Tools & Integrations
- **Orders DB**: Validate order/delivery details.
- **AI Damage Verification Tool**: Confidence scoring.
- **Fraud Engine**: Cross-reference customer history.
- **Refund System API**: Trigger payments.
- **Ticketing System**: Status updates, logging.

---

## Failure & Fallback Paths

| Issue | Resolution |
|-------|-----------|
| AI tool down | Manual review by supervisor (flag all tickets affected). |
| Vendor unresponsive (>48h) | Auto-approve if AI ≥ 70% + supervisor sign-off. |
| Payment system failure | Log refund request; retry hourly; notify customer of delay. |
| Customer no-response (>48h) | Auto-close with template `NO_RESPONSE_CLOSURE`; reopen if customer contacts within 30 days. |

---

