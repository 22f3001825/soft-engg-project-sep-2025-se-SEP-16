---
title: Policy – Apparel & Fashion Returns
portal: [agent, customer]
effective_date: 2025-11-13
owner: product_policy_team
tags: [returns, apparel, fashion, policy, clothing]
security_tier: public
intent: policy
canonical_source: /agent/policy_apparel_returns.md
related_docs: [sop_refund_approval.md, policy_electronics_returns.md, policy_food_returns.md, policy_home_returns.md]
---

# Apparel & Fashion Category – Return Policy

## Eligibility
- Returns allowed within **7 days** of delivery.
- Product must be **unworn**, **unwashed**, and **tags intact** (original manufacturer tags attached).
- All original packaging, bags, and accessories (belts, extra buttons, etc.) must be included.
- No visible signs of use: no stains, odors, alterations, or damage.

## Non-Eligible Items
- **Undergarments and intimate wear** (bras, underwear, shapewear) – hygiene policy.
- **Socks and hosiery** – hygiene policy.
- **Custom-fitted or altered garments** (tailored suits, hemmed pants, custom embroidery).
- **Swimwear** (if hygiene seal is broken).
- **Clearance/sale items marked "Final Sale"** (displayed at checkout).
- **Used or worn items** (makeup stains, deodorant marks, stretched fabric).

## Defect/Damage Returns (Exception)
Even if worn/washed, returns **are accepted** if:
- **Manufacturing defect** (stitching failure, zipper malfunction, color bleeding) – photo evidence required.
- **Damaged on arrival** (torn fabric, missing buttons, stains from warehouse) – must report within 24 hours of delivery with unboxing photos.
- **Wrong size/color/item shipped** – photo of received item + order confirmation required.
- **Fabric mismatch** (e.g., listed as "100% cotton" but tag shows polyester blend) – photo of product tag required.

**Required Evidence for Defect Claims:**
- Close-up photos of defect (stitching, zipper, stain, tear).
- Photo of product care label and size tag.
- Photo showing product alongside order packing slip.
- For color mismatch: Photo in natural lighting + product listing screenshot.

## Quality Check Process

### **Step 1: Customer Initiates Return**
- Customer submits return request via portal/app.
- Uploads photos (if claiming defect/damage).
- Selects return reason: Wrong size / Doesn't fit / Defective / Not as described / Changed mind.

### **Step 2: Return Approval (Agent Review)**
- Agent verifies return window (≤7 days from delivery).
- Checks product is not in non-eligible list.
- If defect claimed: Reviews photos, checks AI verification score.
- If approved: Generates return shipping label (courier pickup scheduled).

### **Step 3: Product Return to Warehouse/Vendor**
- Customer ships product back (or courier pickup).
- Warehouse/vendor receives product within 7 days of return approval.

### **Step 4: AI Quality Scanner Verification**
**AI scans for:**
- Tag presence (manufacturer tags must be attached).
- Wear indicators (fabric stretching, pilling, fading).
- Stains, odors, alterations.
- Packaging completeness.

**AI Confidence Scoring:**
| AI Score | Condition Assessment | Action |
|----------|---------------------|--------|
| ≥ 85% | Unworn, tags intact, resellable | Auto-approve full refund |
| 60-84% | Minor ambiguity (slight wrinkles, packaging wear) | Manual inspection by warehouse staff |
| < 60% | Signs of wear/use detected | Reject return; notify customer with evidence photos |

### **Step 5: Vendor Approval (if applicable)**
- For vendor-managed brands: Vendor conducts final QC within **48 hours**.
- Vendor checks brand-specific quality standards.
- If vendor approves → Refund issued.
- If vendor rejects → Customer notified with rejection reasoning + photos.

### **Step 6: Refund Issuance**
- Full refund credited to original payment method within **3-5 business days** of QC approval.
- Refund notification sent via email/SMS.

## Partial Refunds

| Scenario | Deduction | Reason |
|----------|-----------|--------|
| **Tags removed but unworn** | 15% restocking fee | Reduces resale value |
| **Minor packaging damage (product intact)** | 10% restocking fee | Re-packaging cost |
| **Missing accessories (belt, extra buttons)** | Accessory value (₹50-₹200) | Replacement cost |
| **Slight wrinkles from shipping** | No deduction | Normal transit wear |

## Return Rejection Reasons

| Rejection Code | Reason | Customer Communication |
|---------------|--------|----------------------|
| **RJ01** | Product worn/washed | "AI detected signs of use (fabric stretching, odor). Photo evidence attached." |
| **RJ02** | Tags removed/missing | "Manufacturer tags must be attached for returns. Policy clause 2.1." |
| **RJ03** | Beyond 7-day window | "Request submitted on day 9. Return window closed on [date]." |
| **RJ04** | Non-returnable category | "Undergarments/socks cannot be returned per hygiene policy." |
| **RJ05** | Stains/damage (customer-caused) | "Product shows post-delivery damage inconsistent with shipping/manufacturing defect." |
| **RJ06** | Vendor rejection | "Vendor QC inspection flagged [specific issue]. Rejection photos attached." |

## Exception Handling

### **Supervisor Overrides (Approved Cases)**
Supervisors can approve refunds **beyond standard policy** if:

1. **Verified manufacturing defect** (vendor confirms batch defect, multiple customers report same issue).
2. **Delivery delay caused policy lapse** (delivery 3+ days late; proof from courier required).
3. **Size chart error on website** (customer ordered per size chart, but garment sizing incorrect; QA team confirms listing error).
4. **Goodwill gesture for VIP customers** (high lifetime value, no prior return history, exceptional case).
5. **Medical/emergency circumstances** (customer hospitalized during return window; medical certificate required).

### **Supervisor Rejection Overrides (Denied Cases)**
Even if defect claimed, supervisor **may reject** if:
- Customer history shows **pattern of abuse** (4+ returns in 60 days, all with tags removed).
- Photo evidence **contradicts claim** (customer says "color mismatch" but photos show correct color).
- **Fraudulent documentation** (edited images, stock photos, fake defect claims).

## Special Scenarios

### **Scenario 1: Wrong Size Delivered**
- **Policy**: Full refund OR free exchange (customer's choice).
- **Process**: Customer keeps wrong item until correct size ships; after delivery, return wrong item with prepaid label.
- **Timeline**: No 7-day window applied (since it's fulfillment error).

### **Scenario 2: Color Mismatch (Website vs. Received)**
- **Policy**: Full refund if customer provides side-by-side photo (website screenshot + received item).
- **Process**: Agent verifies product listing color accuracy; if website error confirmed → refund approved + listing corrected.

### **Scenario 3: Fabric Quality Complaint ("Feels Cheap")**
- **Policy**: Not eligible for return unless fabric composition misrepresented (e.g., listing says "silk" but tag shows "polyester").
- **Process**: Customer must provide photo of fabric care label; if mismatch confirmed → refund approved.

### **Scenario 4: Fit Issues ("Too Tight/Loose")**
- **Policy**: Returns allowed if tags intact and within 7 days (customer responsibility to check size chart).
- **No refund if**: Tags removed, item worn outside (outdoor use signs detected), or beyond window.

### **Scenario 5: Sale/Clearance Items**
- **Policy**: Returns allowed unless marked "Final Sale" at checkout.
- **Process**: Agent checks order history; if "Final Sale" flag present → return denied (refund policy disclosed pre-purchase).

## Fraud Prevention (Apparel-Specific)

### **Common Fraud Patterns:**
1. **Wardrobing** (wearing once for event, then returning) – detected via makeup stains, deodorant marks, outdoor wear signs.
2. **Tag swapping** (attaching old tags to used items) – AI verifies tag style/font matches current season.
3. **Damaged-item swaps** (buying new, returning old/damaged version) – AI compares product batch codes, manufacturing dates.

### **Fraud Detection Signals:**
- Same customer returns **same product category** repeatedly (e.g., 5 dresses returned in 2 weeks).
- Return requests consistently filed on **day 6-7** (maximizing wear time before return window closes).
- **High-value items** (designer clothing >₹10,000) from new accounts with no purchase history.

**Action**: Flag for fraud review (code `F03_APPAREL_ABUSE`); escalate to supervisor; may result in account restrictions [web:1][web:11][attached_file:25].

## Customer Communication Templates

### **Approved:**
"Your return has been approved. The refund of ₹{{amount}} will be credited within 3-5 business days once the product passes our quality inspection. Return shipping label sent to your email."

### **Rejected (Tags Removed):**
"Unfortunately, we cannot accept this return as the manufacturer tags have been removed, which violates our Apparel Return Policy (Clause 2.1 – Tag Intact Requirement). Items must have original tags attached to qualify for returns."

### **Partial Refund (Packaging Damage):**
"Your return has been approved with a partial refund. The product is in good condition, but the original packaging was damaged. A 10% restocking fee (₹{{fee}}) has been deducted. Net refund: ₹{{net_amount}}."


## Key Differences from Other Categories

| Aspect | Apparel | Electronics | Food | Home |
|--------|---------|------------|------|------|
| **Return Window** | 7 days | 10 days | 48 hours | 14 days |
| **Key Requirement** | Tags intact | Sealed box | Unopened | Unused |
| **Hygiene Exclusions** | Undergarments, socks | Earphones | Opened items | Used candles |
| **Defect Claims** | Stitching, fabric | Screen, battery | Expiry, contamination | Chips, cracks |
| **Vendor QC** | Optional | Required for high-value | Not applicable | Required for custom |



