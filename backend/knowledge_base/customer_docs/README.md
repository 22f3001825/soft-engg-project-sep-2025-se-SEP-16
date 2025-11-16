# Customer Knowledge Base

This folder contains customer-facing documentation for the RAG-based chatbot.

## Contents

### 1. FAQ Documents (CSV Format)
- **faq_returns_refunds.csv** - 25 FAQ entries in structured format
  - Optimized for RAG retrieval
  - Includes keywords and related topics
  - Categories: General, Refund Process, Return Shipping, Damaged Items, etc.

### 2. Policy Documents (Markdown Format)
- **policy_customer_returns.md** - Complete customer return & refund policy
  - Return eligibility requirements
  - Refund methods and processing times
  - Category-specific return windows
  - Special circumstances and exceptions

### 3. Guide Documents (Markdown Format)
- **guide_refund_eligibility.md** - Refund eligibility checker guide
  - Quick eligibility checker
  - Eligibility by product category
  - Eligibility by return reason
  - Tips for successful returns

- **faq_returns_refunds.md** - Comprehensive FAQ in markdown format
  - General return policy
  - Refund process details
  - Return shipping information
  - Specific situations and troubleshooting

## Document Statistics

- **Total Documents**: 27 customer-facing documents
- **FAQ Entries**: 25 individual Q&A pairs
- **Policy Documents**: 1 comprehensive policy
- **Guide Documents**: 2 detailed guides

## Categories Covered

1. **General Returns** (3 FAQs)
   - Return windows
   - Non-returnable items
   - Packaging requirements

2. **Refund Process** (3 FAQs)
   - Refund timeline
   - Refund methods
   - Refund amounts

3. **Return Shipping** (3 FAQs)
   - Shipping costs
   - Return process
   - In-store returns

4. **Refund Status** (3 FAQs)
   - Status checking
   - Status meanings
   - Delayed refunds

5. **Special Situations**
   - Damaged items
   - Wrong items
   - Exchanges
   - Late returns
   - Gift returns
   - Sale items
   - International returns
   - Bulk orders

## Usage in RAG Chatbot

These documents are automatically loaded by the knowledge loader and indexed for:
- Semantic search
- Context-aware responses
- Refund eligibility verification
- Return guidance
- Policy clarification

## Document Format

### CSV Format (FAQs)
```csv
category,question,answer,keywords,related_topics
General,How long do I have to return an item?,"You have 30 days...","return window,30 days","return policy,eligibility"
```

### Markdown Format (Policies & Guides)
```markdown
# Document Title

## Section

Content with detailed information...
```

## Keywords & Tags

Documents are tagged with relevant keywords for better search:
- return window
- refund timeline
- shipping cost
- damaged item
- exchange
- eligibility
- policy
- process

## Integration

The knowledge loader (`app/services/knowledge_loader.py`) automatically:
1. Loads all markdown files from this folder
2. Parses CSV files into individual FAQ entries
3. Extracts keywords and tags
4. Indexes content for RAG retrieval
5. Provides search functionality

## Testing

Run the customer knowledge base test:
```bash
python backend/scripts/test_customer_kb.py
```

Expected output:
- 46 total documents loaded (19 agent/supervisor + 27 customer)
- 27 customer-facing documents
- 25 FAQ entries from CSV
- Search functionality working

## Maintenance

To add new customer documentation:
1. Create markdown file in this folder
2. Or add entries to faq_returns_refunds.csv
3. Follow naming convention: `type_topic.md` or `faq_topic.csv`
4. Include relevant keywords
5. Test with knowledge loader

## Next Steps

This knowledge base is ready for:
- RAG-based chatbot integration
- Semantic search implementation
- Context-aware response generation
- Refund eligibility verification
- Customer support automation
