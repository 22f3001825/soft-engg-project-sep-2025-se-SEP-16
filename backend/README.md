# Intellica Backend 


## Quick Start

### Prerequisites

- Python 3.8+ (SQLite is included with Python)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize database (skip if intellica.db already exists)**
   ```bash
   python -c "from app.database import engine; from app.models.base import Base; Base.metadata.create_all(bind=engine)"
   ```

5. **Seed database with test data (skip if intellica.db already exists)**
   ```bash
   python create_medium_seed.py
   ```
   
   **Note**: If the database file (intellica.db) already exists in the backend directory, skip steps 4 and 5.

6. **Configure AI Services (Recommended)**
   
   Create a `.env` file in the backend directory:
   ```env
   GROK_API_KEY=your_groq_api_key_here
   GROK_MODEL=llama-3.1-8b-instant
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   **Important**: 
   - Get your Groq API key from: https://console.groq.com/keys
   - The application uses `GROK_API_KEY` as the environment variable name
   - **Groq API provides fast, production-ready AI responses**
   - Ollama is used as a fallback if API keys are not configured (slower performance)

7. **Ollama Setup (Fallback Only)**
   
   Only needed if you don't configure API keys:
   ```bash
   # Run Ollama server
   ollama serve
   
   # Pull a model (in another terminal)
   ollama pull "model_name"
   
   # Update model name in app/services/llm_service.py
   # self.model = "model_name"
   ```

8. **Run the application**
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   The API will be available at `http://127.0.0.1:8000`


## Login Credentials

The database is seeded with test users for different portals. Use these credentials to login:

### Customer Accounts (Password: customer123)
- ali.jawad@gmail.com (Ali Jawad)
- rachita.vohra@yahoo.com (Rachita Vohra)
- harsh.mathur@outlook.com (Harsh Mathur)
- priya.mehta@gmail.com (Priya Mehta)
- aman.verma@hotmail.com (Aman Verma)
- sarah.johnson@gmail.com (Sarah Johnson)
- michael.chen@yahoo.com (Michael Chen)
- emily.rodriguez@gmail.com (Emily Rodriguez)
- david.kim@outlook.com (David Kim)
- jessica.brown@gmail.com (Jessica Brown)

### Agent Accounts (Password: agent123)
- emma.wilson@intellica.com (Emma Wilson)
- james.taylor@intellica.com (James Taylor)
- olivia.davis@intellica.com (Olivia Davis)
- william.miller@intellica.com (William Miller)
- isabella.moore@intellica.com (Isabella Moore)

### Supervisor Account (Password: demo2024)
- supervisor.demo@intellica.com (Robert Johnson)

### Vendor Account (Password: vendor123)
- vendor@techmart.com (TechMart Solutions Team)

**Note:** All passwords are encrypted in the database. Use the plain text passwords above for login.

### Database Features
- **Real-time Data**: All counts and metrics calculated dynamically
- **Logical Relationships**: Orders, tickets, and complaints properly linked
- **File Attachments**: Support for ticket file uploads with validation
- **Notification System**: Role-based notifications with filtering
- **Analytics**: Trend analysis based on actual data relationships

## API Documentation

Once running, visit `http://127.0.0.1:8000/docs` for interactive API documentation.

### Authentication
- **POST** `/auth/login` - User login with email/password
- **POST** `/auth/register` - User registration

### Customer APIs (`/api/v1/customer/`)
- **GET** `/dashboard` - Dashboard overview with stats and charts
- **GET** `/orders` - List orders with filtering (status, search)
- **GET** `/orders/{order_id}` - Order details
- **GET** `/orders/track/{order_id}` - Order tracking info
- **POST** `/orders/return` - Request order return/refund
- **GET** `/tickets` - List support tickets with filtering
- **POST** `/tickets` - Create new support ticket
- **GET** `/tickets/{ticket_id}` - Ticket details with messages
- **POST** `/tickets/{ticket_id}/messages` - Add message to ticket
- **POST** `/tickets/{ticket_id}/attachments` - Upload ticket attachments
- **GET** `/profile` - Customer profile information
- **PUT** `/profile` - Update customer profile
- **GET** `/settings` - Customer settings
- **PUT** `/settings` - Update customer settings
- **GET** `/notifications` - List notifications
- **PUT** `/notifications/{id}/read` - Mark notification as read
- **DELETE** `/notifications/{id}` - Delete notification

### Vendor APIs (`/api/vendor/`)
- **GET** `/dashboard` - Vendor dashboard with metrics
- **GET** `/analytics` - Detailed analytics and trends
- **GET** `/complaints` - Product complaints overview
- **GET** `/profile` - Vendor profile information
- **PUT** `/profile` - Update vendor profile
- **GET** `/settings` - Vendor settings
- **GET** `/notifications` - List vendor notifications
- **PUT** `/notifications/{id}/read` - Mark notification as read
- **DELETE** `/notifications/{id}` - Delete notification

### Agent APIs (`/api/v1/agent/`)
- **GET** `/dashboard` - Agent dashboard overview
- **GET** `/tickets` - List assigned/available tickets with filtering
- **GET** `/tickets/{ticket_id}` - Ticket details with messages and customer info
- **PUT** `/tickets/{ticket_id}/assign` - Assign ticket to agent
- **PUT** `/tickets/{ticket_id}/status` - Update ticket status
- **PUT** `/tickets/{ticket_id}/resolve` - Mark ticket as resolved
- **POST** `/tickets/{ticket_id}/messages` - Add agent response
- **POST** `/tickets/{ticket_id}/refund/approve` - Approve refund request
- **POST** `/tickets/{ticket_id}/refund/reject` - Reject refund request
- **GET** `/customers` - List customers assigned to agent
- **GET** `/customers/{customer_id}` - Customer details with orders/tickets
- **GET** `/settings` - Agent settings
- **PUT** `/settings` - Update agent settings

### Supervisor APIs (`/api/v1/supervisor/`)
- **GET** `/dashboard` - Supervisor dashboard with team metrics
- **GET** `/tickets` - List all tickets with filtering
- **GET** `/agents` - List all agents with performance data
- **GET** `/customers` - List all customers with statistics
- **GET** `/analytics` - System-wide analytics with time ranges
- **PUT** `/tickets/{ticket_id}/reassign` - Reassign ticket to different agent
- **PUT** `/tickets/{ticket_id}/resolve` - Mark ticket as resolved
- **PUT** `/tickets/{ticket_id}/close` - Close ticket
- **PUT** `/agents/{agent_id}/status` - Block/unblock agent
- **PUT** `/customers/{customer_id}/status` - Block/unblock customer

### File Uploads
- **POST** `/api/v1/customer/tickets/{ticket_id}/attachments` - Upload files to tickets
- **GET** `/uploads/tickets/{ticket_id}/{filename}` - Access uploaded files

### Query Parameters
- `status` - Filter by status (orders, tickets, agents, customers)
- `search` - Search by ID, name, email, or text
- `priority` - Filter tickets by priority (HIGH, MEDIUM, LOW)
- `assigned_only` - Show only assigned tickets (agents)
- `unread_only` - Filter notifications (true/false)
- `date_range` - Analytics date range in days
- `time_range` - Analytics time range (24h, 7d, 30d)
- `status_filter` - Filter agents/customers by status

### Response Formats
All APIs return JSON responses with consistent error handling:
```json
{
  "message": "Success message",
  "data": { ... }
}
```

Error responses:
```json
{
  "detail": "Error message"
}
```
