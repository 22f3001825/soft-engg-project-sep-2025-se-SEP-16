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

4. **Initialize database**
   ```bash
   # Create database tables automatically
   python -c "from app.database import engine; from app.models.base import Base; Base.metadata.create_all(bind=engine)"
   ```

5. **Run the application**
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

## API Documentation

Once running, visit `http://127.0.0.1:8000/docs` for interactive API documentation.
