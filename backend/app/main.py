from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import auth, customer, agent, supervisor, vendor, copilot, chat
import os

app = FastAPI(
    title="Intellica",
    description="Simple AI-powered customer support platform",
    version="1.0.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
if not os.path.exists("uploads"):
    os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(customer.router, prefix="/api/v1/customer", tags=["Customer"])
app.include_router(agent.router, prefix="/api/v1/agent", tags=["Agent"])
app.include_router(supervisor.router, prefix="/api/v1/supervisor", tags=["Supervisor"])
app.include_router(vendor.router, prefix="/api/v1/vendor", tags=["Vendor"])
app.include_router(copilot.router, prefix="/api/v1", tags=["AI Copilot"])
app.include_router(chat.router, prefix="/api/v1", tags=["Chat"])

@app.get("/")
async def root():
    return {"message": "Welcome to Intellica AI Support System API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/test-uploads")
async def test_uploads():
    """Test endpoint to check if uploads directory is accessible"""
    uploads_path = "uploads"
    if os.path.exists(uploads_path):
        files = []
        for root, dirs, filenames in os.walk(uploads_path):
            for filename in filenames[:5]:
                relative_path = os.path.relpath(os.path.join(root, filename), uploads_path)
                files.append(relative_path)
        return {
            "uploads_exists": True,
            "sample_files": files,
            "uploads_path": os.path.abspath(uploads_path)
        }
    else:
        return {
            "uploads_exists": False,
            "uploads_path": os.path.abspath(uploads_path)
        }


