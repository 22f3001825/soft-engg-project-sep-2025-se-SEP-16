from fastapi import APIRouter

from .auth import router as auth_router
from .customer import router as customer_router
from .agent import router as agent_router
from .supervisor import router as supervisor_router
from .vendor import router as vendor_router

router = APIRouter()
router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(customer_router, tags=["customer"])
router.include_router(agent_router, tags=["agent"])
router.include_router(supervisor_router, tags=["supervisor"])
router.include_router(vendor_router, tags=["vendor"])
