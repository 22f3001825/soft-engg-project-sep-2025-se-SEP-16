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

## API Documentation

Once running, visit `http://127.0.0.1:8000/docs` for interactive API documentation.
