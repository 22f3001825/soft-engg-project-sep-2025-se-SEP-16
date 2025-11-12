from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

class UserInDBBase(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class TokenData(BaseModel):
    email: Optional[str] = None

class UserResponse(BaseModel):
    email: EmailStr
    full_name: str
    role: str

    class Config:
        from_attributes = True

# Profile schemas
class CustomerProfileBase(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    preferences: Optional[dict] = None

class CustomerProfileCreate(CustomerProfileBase):
    pass

class CustomerProfile(CustomerProfileBase):
    user_id: int

    class Config:
        from_attributes = True

class AgentProfileBase(BaseModel):
    department: Optional[str] = None
    skills: Optional[list] = None
    experience_years: Optional[int] = None

class AgentProfileCreate(AgentProfileBase):
    pass

class AgentProfile(AgentProfileBase):
    user_id: int

    class Config:
        from_attributes = True

class SupervisorProfileBase(BaseModel):
    department: Optional[str] = None
    team_size: Optional[int] = None

class SupervisorProfileCreate(SupervisorProfileBase):
    pass

class SupervisorProfile(SupervisorProfileBase):
    user_id: int

    class Config:
        from_attributes = True

class VendorProfileBase(BaseModel):
    company_name: Optional[str] = None
    business_type: Optional[str] = None
    contact_info: Optional[dict] = None

class VendorProfileCreate(VendorProfileBase):
    pass

class VendorProfile(VendorProfileBase):
    user_id: int

    class Config:
        from_attributes = True
