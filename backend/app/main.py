from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, customer

app = FastAPI(
    title="AI Support System",
    description="Simple AI-powered customer support platform",
    version="1.0.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(customer.router, prefix="/api/v1", tags=["Customer"])

@app.get("/")
async def root():
    return {"message": "Welcome to AI Support System API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
