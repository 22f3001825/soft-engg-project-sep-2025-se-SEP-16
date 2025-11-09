# Intellica Backend API

FastAPI backend for the Intellica AI-powered customer support platform.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Customer Portal**: Ticket management, order tracking, profile management
- **Agent Portal**: Ticket handling, customer communication, response templates
- **Supervisor Portal**: Team management, ticket oversight, analytics
- **Vendor Portal**: Product management, order fulfillment, complaint handling

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Pydantic schemas
- **Migration**: Alembic

## Quick Start

### Prerequisites

- Python 3.8+
- PostgreSQL database

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

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and other settings
   ```

5. **Set up database**
   ```bash
   # Create PostgreSQL database (adjust command based on your PostgreSQL setup)
   createdb intellica

   # Or using psql:
   psql -U postgres -c "CREATE DATABASE intellica;"

   # Initialize database tables
   python -c "from app.database import engine; from app.models.base import Base; Base.metadata.create_all(bind=engine)"
   ```

6. **Run the application**
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

The API will be available at `http://127.0.0.1:8000`

## API Documentation

Once running, visit `http://127.0.0.1:8000/docs` for interactive API documentation.

## Testing the API

### Register a new user
```bash
curl -X POST "http://127.0.0.1:8000/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "full_name": "Test User",
       "password": "password123",
       "role": "CUSTOMER"
     }'
```

### Login
```bash
curl -X POST "http://127.0.0.1:8000/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=test@example.com&password=password123"
```

### Get current user info
```bash
curl -X GET "http://127.0.0.1:8000/auth/me" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Project Structure

```
backend/
├── app/
│   ├── api/           # API endpoints
│   │   ├── auth.py    # Authentication endpoints
│   │   ├── customer.py
│   │   ├── agent.py
│   │   ├── supervisor.py
│   │   └── vendor.py
│   ├── core/          # Core functionality
│   │   ├── config.py  # Application settings
│   │   └── security.py # JWT and password utilities
│   ├── models/        # Database models
│   │   ├── user.py    # User and profile models
│   │   ├── ticket.py  # Ticket and message models
│   │   └── base.py    # Base model class
│   ├── schemas/       # Pydantic schemas
│   │   └── user.py    # User-related schemas
│   ├── services/      # Business logic
│   │   └── auth.py    # Authentication services
│   └── main.py        # FastAPI app initialization
├── tests/             # Test files
├── .env.example       # Environment variables template
├── requirements.txt   # Python dependencies
└── README.md
```

## User Roles

- **Customer**: Can create tickets, track orders, manage profile
- **Agent**: Can handle assigned tickets, communicate with customers
- **Supervisor**: Can manage team, oversee all tickets, assign agents
- **Vendor**: Can manage products, handle orders, respond to complaints

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database Configuration
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=intellica

# JWT Configuration
SECRET_KEY=your-secret-key-here-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server Configuration
SERVER_NAME=Intellica
SERVER_HOST=http://localhost:8000

# CORS Origins (comma-separated)
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black .
isort .
```

### Type Checking
```bash
mypy .
```

### Database Migrations (if using Alembic)
```bash
alembic revision --autogenerate -m "message"
alembic upgrade head
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if database exists: `psql -U postgres -l`

### Import Errors
- Ensure virtual environment is activated
- Install dependencies: `pip install -r requirements.txt`

### Port Already in Use
- Change port: `uvicorn app.main:app --port 8001 --reload`
