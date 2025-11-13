from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, customer, agent, supervisor, vendor

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
app.include_router(agent.router, prefix="/api/v1", tags=["Agent"])
app.include_router(supervisor.router, prefix="/api/v1", tags=["Supervisor"])
app.include_router(vendor.router, prefix="/api/vendor", tags=["Vendor"])

@app.get("/")
async def root():
    return {"message": "Welcome to AI Support System API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
