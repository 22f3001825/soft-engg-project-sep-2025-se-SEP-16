<div align="center">

# 🎯 Intellica

### AI-Powered Customer Support Platform

*Transform customer support with intelligent automation and seamless collaboration*

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)

[Features](#-key-features) • [Demo](#-live-demo) • [Installation](#-quick-start) • [Documentation](#-documentation) • [Team](#-meet-the-team)

</div>

---

## 🚀 Overview

Intellica is a customer support platform that harnesses the power of artificial intelligence to revolutionize how businesses manage customer interactions. Built with modern technologies and intelligent automation, Intellica provides a comprehensive solution for support teams, customers, supervisors, and vendors.

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🎫 Smart Ticketing System
- Advanced ticket management with real-time updates
- File attachments with validation
- Priority-based categorization
- Status tracking and history

</td>
<td width="50%">

### 🤖 AI-Powered Intelligence
- **RAG Chatbot**: Context-aware customer assistance
- **AI Copilot**: Real-time agent support
- **Smart Classification**: Automated priority assignment
- **Natural Language Processing**: Understanding user intent

</td>
</tr>
<tr>
<td width="50%">

### 👥 Multi-Role Portal
- **Customer Dashboard**: Self-service & ticket tracking
- **Agent Interface**: Efficient ticket management
- **Supervisor Panel**: Team oversight & analytics
- **Vendor Access**: Seamless collaboration
- **Role-based permissions**: Secure access control

</td>
<td width="50%">

### 📊 Analytics & Insights
- Real-time performance metrics
- Trend analysis and forecasting
- Agent productivity tracking
</td>
</tr>
</table>

---

## 🏗️ Technology Stack

<div align="center">

### Frontend Architecture
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

### Backend Architecture
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

### AI & Machine Learning
![Groq](https://img.shields.io/badge/Groq-FF6B6B?style=for-the-badge&logo=ai&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)

</div>

### 🔧 Technical Highlights

```
📦 Project Structure
├── 🎨 Frontend (React.js)
│   ├── Multi-role dashboards
│   ├── Real-time messaging
│   ├── Responsive UI/UX
│   └── Component-based architecture
│
├── ⚙️ Backend (FastAPI)
│   ├── RESTful API endpoints
│   ├── JWT authentication
│   ├── SQLAlchemy ORM
│   └── Role-based access control
│
├── 🤖 AI Services
│   ├── RAG (Retrieval-Augmented Generation)
│   ├── LLM Integration (Groq/Gemini)
│   ├── Local AI (Ollama fallback)
│   └── ML-based classification
│
└── 🗄️ Database (SQLite)
    ├── Relational data model
    ├── Real-time updates
    ├── File storage support
    └── Transaction management
```

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js** v16+ with Yarn package manager
- **Python** 3.8+ (SQLite included)
- **Git** for version control
- **Ollama** (optional, for local AI fallback)

### ⚡ Installation

#### 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd soft-engg-project-sep-2025-se-SEP-16
```

**Important**: Ensure you have activated the virtual environment before running any Python commands.

#### 2️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
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

#### 3️⃣ Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
yarn install

# Start development server
yarn start
```

#### 4️⃣ AI Services Configuration

Create a `.env` file in the `backend` directory:

```env
# Groq API (Primary - Recommended)
GROK_API_KEY=your_groq_api_key_here
GROK_MODEL=llama-3.1-8b-instant

# Gemini API (Secondary)
GEMINI_API_KEY=your_gemini_api_key_here
```

> **⚠️ Important Notes:**
> - The service is **Groq** (https://groq.com), but uses `GROK_API_KEY` as the environment variable name
> - Get your Groq API key from: https://console.groq.com/keys
> - **Groq API provides fast, production-ready AI responses**
> - Ollama is used as a fallback if API keys are unavailable (slower performance)

##### Optional: Ollama Setup (Fallback)

```bash
# Run Ollama server
ollama serve

# Pull a model (in another terminal)
ollama pull "model_name"

# Update model name in backend/app/services/llm_service.py
# self.model = "model_name"
```

---

## 🎯 Live Demo

### 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application interface |
| **Backend API** | http://127.0.0.1:8000 | REST API endpoints |
| **API Docs** | http://127.0.0.1:8000/docs | Interactive API documentation |

### 👤 Demo Credentials

Test the platform with pre-configured accounts:

<table>
<tr>
<th>Role</th>
<th>Email</th>
<th>Password</th>
<th>Access Level</th>
</tr>
<tr>
<td>🛍️ <strong>Customer</strong></td>
<td><code>ali.jawad@gmail.com</code></td>
<td><code>customer123</code></td>
<td>Submit tickets, track status, chat support</td>
</tr>
<tr>
<td>🎧 <strong>Agent</strong></td>
<td><code>emma.wilson@intellica.com</code></td>
<td><code>agent123</code></td>
<td>Manage tickets, AI assistance, customer chat</td>
</tr>
<tr>
<td>👔 <strong>Supervisor</strong></td>
<td><code>supervisor.demo@intellica.com</code></td>
<td><code>demo2024</code></td>
<td>Team oversight, analytics, performance metrics</td>
</tr>
<tr>
<td>🏢 <strong>Vendor</strong></td>
<td><code>vendor@techmart.com</code></td>
<td><code>vendor123</code></td>
<td>Vendor-specific products perfomance</td>
</tr>
</table>

> 💡 **Tip**: Additional test accounts are available in the backend README

---

## 🤖 AI Features Deep Dive

### RAG Chatbot

Our Retrieval-Augmented Generation chatbot provides intelligent, context-aware customer support:

- **Contextual Understanding**: Analyzes ticket history and user context
- **Real-time Responses**: Powered by Groq's high-performance API
- **Fallback Support**: Seamless transition to Ollama for offline capabilities
- **Knowledge Base Integration**: Accesses relevant documentation and solutions

### AI Copilot for Agents

Enhances agent productivity with intelligent assistance:

- **Smart Suggestions**: Provides relevant response templates
- **Priority Classification**: ML-based ticket priority assignment
- **Sentiment Analysis**: Detects customer emotions and urgency
- **Automated Routing**: Intelligent ticket assignment
- **Performance Insights**: Real-time agent performance metrics

### Ticket Priority Classification

Our intelligent classification system considers:

- **Urgency Indicators**: Keywords and phrases indicating urgency
- **Content Analysis**: NLP-based issue severity detection
- **Historical Patterns**: Learning from past ticket resolutions
- **Rule-based Fallback**: Ensures reliability when AI is unavailable

---

## 📊 Features Showcase

### Customer Portal
- 📝 Create and track support tickets
- 💬 chat with support agents
- 🤖 AI-powered chatbot assistance
- 📎 File attachment support
- 📈 Ticket history and status tracking

### Agent Portal
- 🎫 Comprehensive ticket management
- 🤖 AI Copilot for intelligent suggestions
- 💬 Multi-customer chat interface
- 🔔 Real-time notifications

### Supervisor Portal
- 👥 Team performance overview
- 📊 Advanced analytics and reporting
- 👤 User and role management

### Vendor Portal
- 🏢 Vendor-specific dashboard
- 📊 Vendor performance metrics

---

## 🎓 Development Methodology

This project was developed using **Agile Scrum** methodology with:

- **Sprint Planning**: Two-week sprints with clear objectives
- **Daily Standups**: Team synchronization and blocker resolution
- **Sprint Reviews**: Stakeholder demonstrations and feedback
- **Sprint Retrospectives**: Continuous improvement discussions
- **Product Backlog**: Prioritized feature list and user stories
- **Version Control**: Git workflow with feature branches

### Development Tools & Practices

- **Git**: Version control and collaboration
- **GitHub**: Repository hosting and project management
- **Code Reviews**: Peer review process for quality assurance
- **Testing**: Unit and integration testing
- **Documentation**: Comprehensive inline and external docs

---

## 🛠️ Production Build

### Frontend Production Build

```bash
cd frontend
yarn build
```

The optimized production build will be available in `frontend/build` directory.

### Backend Deployment Considerations

- Configure production database (PostgreSQL/MySQL recommended)
- Set up environment variables securely
- Enable HTTPS and SSL certificates
- Configure CORS for production domains
- Set up logging and monitoring
- Implement rate limiting and security headers

---

## 📖 Documentation

- **API Documentation**: Available at `http://127.0.0.1:8000/docs` (Swagger UI)
- **Backend README**: Detailed setup in `backend/README.md`
- **Frontend README**: Component docs in `frontend/README.md`
- **AI Services Guide**: Configuration in backend documentation

---

## 👥 Meet the Team

<div align="center">

### Team SEP-16 | IIT Madras

*Software Engineering Project - September 2025*

<!-- 
====================================================================================
TO ADD YOUR TEAM PHOTO:
1. Save your team photo from Google Sheets/Drive
2. Create a folder: docs/images/ in your repository root
3. Upload your photo there (e.g., team-photo.jpg or team-sep-16.jpg)
4. Uncomment the line below and replace 'team-photo.jpg' with your actual filename
5. Delete this comment block after adding the photo
====================================================================================
-->

<!-- ![Team SEP-16](docs/images/team-photo.jpg) -->

<br>

**Passionate developers building the future of AI-powered customer support**

</div>

<br>

<div align="center">

| 👤 Name | 🎓 Roll Number | 💼 Role | 
|---------|----------------|---------|
| **Ali Jawad** | 22f3001825 | Full Stack Developer |
| **Deepti Gurnani** | 21f3002204 | Product Manager | 
| **Harsh Mathur** | 23f1000602 | Frontend Developer | 
| **Harshita Jain** | 21f1003224 | Scrum Master | 
| **Mayank Singh** | 23f1000598 | Full Stack Developer |
| **Rachita Vohra** | 22f1001847 | Developer & Tester | 
| **Mohd Aman** | 21f3000044 | Backend Developer | 
| **Duvvuri Sai Kyvalya** | 21f1003975 | GenAI Developer | 

</div>

---

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is developed as part of a software engineering course at **IIT Madras** and is intended for educational purposes.

---

## 🙏 Acknowledgments

- **IIT Madras** - For the educational opportunity and guidance
- **FastAPI** - For the excellent backend framework
- **React Team** - For the powerful frontend library
- **Groq** - For high-performance AI API
- **Google Gemini** - For AI capabilities
- **Ollama** - For local AI model support
- **Open Source Community** - For the amazing tools and libraries

<div align="center">


*IIT Madras | Software Engineering Project | 2025

### ⭐ Star us on GitHub if you find this project useful!

</div>
