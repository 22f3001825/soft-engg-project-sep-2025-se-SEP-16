# Intellica - AI-Powered Customer Support Platform

Transform customer support with AI-powered intelligence and seamless collaboration across multiple roles and departments.

## 🚀 Overview

Intellica is a comprehensive customer support platform that leverages artificial intelligence to enhance support operations. The platform provides dedicated dashboards for customers, agents, supervisors, and vendors, enabling efficient ticket management, real-time communication, and intelligent analytics.

### Key Features

- **Smart Ticketing System** - Advanced support ticket management with real-time messaging and file attachments
- **Multi-Role Portal** - Dedicated dashboards for customers, agents, supervisors, and vendors
- **AI-Powered Intelligence** - RAG Chatbot and AI Copilot for intelligent assistance
- **Analytics & Insights** - Comprehensive analytics with trend analysis and performance metrics

## 🏗️ Architecture

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Python FastAPI with SQLAlchemy
- **Database**: SQLite
- **AI Services**: Groq API (Primary), Gemini API, Ollama (Fallback)
- **Authentication**: JWT-based authentication with role-based access control

## 📋 Prerequisites

- Node.js (v16 or higher) / Yarn
- Python 3.8+ (SQLite is included with Python)
- Git
- Ollama (for local AI fallback)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd soft-engg-project-sep-2025-se-SEP-16
```

**Important**: Ensure you have activated the virtual environment before running any Python commands.

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database (skip if intellica.db already exists)
python -c "from app.database import engine; from app.models.base import Base; Base.metadata.create_all(bind=engine)"

# Seed database with test data (skip if intellica.db already exists)
python create_medium_seed.py

# Note: If the database file (intellica.db) already exists in the backend directory,
# you can skip the database initialization and seeding steps above.

# Run the application (ensure virtual environment is activated)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
yarn install

# Start development server
yarn start
```

### 4. AI Services Configuration 

#### API Keys (Recommended)

Create a `.env` file in the backend directory for optimal AI performance:
```env
GROK_API_KEY=your_groq_api_key_here
GROK_MODEL=llama-3.1-8b-instant
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important Note**: 
- The service is **Groq** (https://groq.com) - get your API key from their website
- However, the application uses `GROK_API_KEY` as the environment variable name (custom naming convention)
- Get your Groq API key from: https://console.groq.com/keys
- **Groq API provides fast, production-ready AI responses**
- Ollama is used as a fallback if API keys are not configured (slower performance)

#### Ollama Setup (Fallback Only)

Ollama is used as a fallback when API keys are unavailable. It provides slower responses but works offline:

```bash
# Run Ollama server
ollama serve

# Pull a model (in another terminal)
ollama pull "model_name"

# Update model name in backend/app/services/llm_service.py
# self.model = "model_name"
```

## 🚀 Running the Application

### Development Mode

1. **Start Backend Server**:
   ```bash
   cd backend
   # Activate virtual environment first
   # Windows: venv\Scripts\activate
   # macOS/Linux: source venv/bin/activate
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   Backend will run on `http://127.0.0.1:8000`
   API Documentation: `http://127.0.0.1:8000/docs`

2. **Start Frontend Server**:
   ```bash
   cd frontend
   yarn start
   ```
   Frontend will run on `http://localhost:3000`

### Access the Application

- **Landing Page**: `http://localhost:3000`
- **Login**: `http://localhost:3000/login`
- **Register**: `http://localhost:3000/register`

## 👤 Demo Credentials

The database is pre-seeded with test users. Use these credentials to explore different portals:

### Customer Portal
- **Email**: ali.jawad@gmail.com
- **Password**: customer123

### Agent Portal
- **Email**: emma.wilson@intellica.com
- **Password**: agent123

### Supervisor Portal
- **Email**: supervisor.demo@intellica.com
- **Password**: demo2024

### Vendor Portal
- **Email**: vendor@techmart.com
- **Password**: vendor123

**Note**: More test accounts are available in the backend README.

## AI Features

### RAG Chatbot
- Intelligent customer support with contextual understanding
- Real-time responses using advanced language models
- Context-aware conversations with ticket history integration

### AI Copilot
- Smart assistance for agents
- Automated ticket priority classification
- Intelligent response suggestions and analytics

### Ticket Priority Classification
- AI-powered classification (HIGH/MEDIUM/LOW)
- Rule-based fallback system
- Considers customer tier, urgency indicators, and content analysis

## 📊 Technology Stack

### Frontend
- **React.js** - Component-based UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Yarn** - Package manager

### Backend
- **Python FastAPI** - Modern web framework
- **SQLAlchemy** - ORM for database operations
- **Uvicorn** - ASGI server
- **JWT** - Authentication and authorization
- **Groq SDK** - AI service integration
- **Google Generative AI** - Gemini API integration

### Database
- **SQLite** - Lightweight database with real-time data
- **File Upload Support** - Ticket attachments with validation
- **Notification System** - Role-based notifications

### AI & ML
- **Groq API** - Primary LLM service 
- **Gemini API** - Secondary AI service 
- **Ollama** - Local AI service
- **RAG (Retrieval-Augmented Generation)** - Enhanced AI responses

## 👥 Team Members

| Name | Roll Number | Role |
|------|-------------|------|
| **Ali Jawad** | 22f3001825 | Full Stack Developer |
| **Deepti Gurnani** | 21f3002204 | Product Manager |
| **Harsh Mathur** | 23f1000602 | Frontend Developer |
| **Harshita Jain** | 21f1003224 | Scrum Master |
| **Mayank Singh** | 23f1000598 | Full Stack Developer |
| **Rachita Vohra** | 22f1001847 | Developer & Tester |
| **Mohd Aman** | 21f3000044 | Backend Developer |
| **Duvvuri Sai Kyvalya** | 21f1003975 | GenAI Developer |

## 📝 API Documentation

Once the backend is running, visit `http://127.0.0.1:8000/docs` for interactive API documentation.

## 🚀 Production Build

```bash
# Build frontend
cd frontend
yarn build

# The build files will be in frontend/build directory
```

## License

This project is developed as part of a software engineering course and is intended for educational purposes.

##  Support

For support and questions, please contact the development team or create an issue in the repository.
