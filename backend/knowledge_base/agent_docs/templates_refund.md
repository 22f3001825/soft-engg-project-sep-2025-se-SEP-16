---
title: Communication Templates – Refund Scenarios
portal: agent
effective_date: 2025-11-13
owner: customer_experience
tags: [templates, communication, refund, email, parameterized]
security_tier: internal
intent: template
canonical_source: /agent/templates_refund.md
variables: [customer_name, order_id, refund_amount, product_name, refund_timeline, rejection_reason, evidence_required, escalation_sla]
---

# Approved Communication Templates – Refund Scenarios

**Usage Instructions:**
- Always personalize with customer name and order ID.
- Replace {{variables}} with actual values from ticket system.
- Do NOT modify template language without supervisor approval.
- Maintain professional tone (see `tone_policy_agent.md`).

---

## **REFUND_APPROVED**

**Subject**: Refund Approved – Order {{order_id}}

Dear {{customer_name}},

Your refund request for Order ID **{{order_id}}** ({{product_name}}) has been approved in accordance with our return policy.

**Refund Details:**
- Amount: ₹{{refund_amount}}
- Payment Method: Original payment method
- Timeline: {{refund_timeline}} (typically 3-5 business days)
- Refund ID: {{refund_id}}

You will receive a confirmation email once the refund is processed. If you have any questions, feel free to reach out.

Thank you for your patience and understanding.

Best regards,  
Intellica Support Team

---

## **REFUND_REJECTED_POLICY**

**Subject**: Refund Request Update – Order {{order_id}}

Dear {{customer_name}},

We have reviewed your refund request for Order ID **{{order_id}}** ({{product_name}}).

Unfortunately, we are unable to approve this request because: **{{rejection_reason}}**

**Policy Reference:**
{{policy_clause}} — {{policy_link}}

**Alternative Options:**
- Exchange for another product (if available)
- Store credit ({{store_credit_amount}})
- Product replacement (if defect confirmed)

If you believe this decision was made in error or have additional information to share, please reply to this email within 48 hours.

Regards,  
Intellica Refund Desk

---

## **REFUND_REJECTED_EVIDENCE**

**Subject**: Additional Information Needed – Order {{order_id}}

Dear {{customer_name}},

We have reviewed the photos/videos you submitted for Order ID **{{order_id}}**.

Unfortunately, the evidence provided does not clearly show the reported issue ({{issue_type}}). To proceed with your refund request, please provide:

**Required Evidence:**
{{evidence_required}}

**Examples:**
- Clear photos showing damage/defect from multiple angles
- Product label with batch/serial number visible
- Packaging showing shipping damage (if applicable)

Please upload these within **48 hours** to avoid case closure. You can submit them by replying to this email or through your account portal.

Thank you for your cooperation.

Intellica Verification Team

---

## **REQUEST_FOR_INFORMATION**

**Subject**: Action Required – Refund Request {{order_id}}

Hello {{customer_name}},

To complete the review of your refund request for Order ID **{{order_id}}**, we need the following information:

**Missing Information:**
{{missing_fields}}

Please provide these details within **48 hours** to avoid delays in resolution. You can reply to this email or update your ticket in the Help Center.

Thank you,  
Intellica Support

---

## **PARTIAL_REFUND_APPROVED**

**Subject**: Partial Refund Approved – Order {{order_id}}

Dear {{customer_name}},

After reviewing your case for Order ID **{{order_id}}** ({{product_name}}), we have approved a **partial refund**.

**Refund Details:**
- Original Order Value: ₹{{order_amount}}
- Partial Refund Amount: ₹{{partial_refund_amount}}
- Reason: {{partial_reason}} (e.g., partial damage, missing accessories, restocking fee)
- Timeline: {{refund_timeline}}

**Calculation Breakdown:**
{{refund_calculation_details}}

If you have questions about this decision, please contact us within 48 hours.

Best regards,  
Intellica Refund Team

---

## **GOODWILL_REFUND**

**Subject**: Goodwill Gesture – Order {{order_id}}

Dear {{customer_name}},

We sincerely apologize for the inconvenience you experienced with Order ID **{{order_id}}**.

While your case falls slightly outside our standard return policy, we value your loyalty and have approved a **goodwill refund** of ₹{{goodwill_amount}}.

This refund will be processed within {{refund_timeline}}. We hope this resolves the matter to your satisfaction.

Thank you for being a valued customer.

Warm regards,  
Intellica Customer Experience Team

---

## **VENDOR_DISPUTE_PENDING**

**Subject**: Refund Under Vendor Review – Order {{order_id}}

Dear {{customer_name}},

Your refund request for Order ID **{{order_id}}** ({{product_name}}) has been forwarded to the vendor for quality verification, as per our policy for vendor-managed products.

**Expected Timeline:**
The vendor has **48 hours** to complete their review. You will receive an update by {{expected_update_date}}.

**What Happens Next:**
- Vendor inspects returned product
- If approved → Full refund issued
- If rejected → You will receive detailed reasoning and alternative options

We appreciate your patience during this process.

Intellica Vendor Relations Team

---

## **ESCALATED_TO_SUPERVISOR**

**Subject**: Your Case Has Been Escalated – Order {{order_id}}

Dear {{customer_name}},

Your refund request for Order ID **{{order_id}}** requires additional review by our senior support team.

**Reason for Escalation:**
{{escalation_reason}}

**Expected Resolution Time:**
You will receive an update within {{escalation_sla}} hours.

We are committed to resolving this matter fairly and promptly. Thank you for your understanding.

Best regards,  
Intellica Support Team

---

## **NO_RESPONSE_CLOSURE**

**Subject**: Ticket Closed – No Response Received – {{order_id}}

Dear {{customer_name}},

We have not received a response to our request for additional information regarding Order ID **{{order_id}}**.

As a result, your refund request has been **closed** as per our policy.

**Reopen Policy:**
If you still wish to proceed, you can reopen this case within **30 days** by replying to this email or contacting support with reference ID {{ticket_id}}.

Thank you,  
Intellica Support

---

## **EXCHANGE_OFFER**

**Subject**: Exchange Available – Order {{order_id}}

Dear {{customer_name}},

While your refund request for Order ID **{{order_id}}** does not meet standard policy criteria, we'd like to offer you a **product exchange** instead.

**Exchange Options:**
- Same product (replacement)
- Alternative product of equal/lesser value
- Store credit: ₹{{store_credit_amount}}

To proceed, please reply with your preferred option within **48 hours**. Shipping for the exchange will be at no additional cost.

Regards,  
Intellica Returns Team

---

