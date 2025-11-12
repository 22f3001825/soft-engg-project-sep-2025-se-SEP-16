from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.database import get_db
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import timedelta
from jose import JWTError, jwt

security = HTTPBearer()

def authenticate_user(db: Session, email: str, password: str, role: str = None):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    if role and user.role.value != role.upper():
        return False
    return user

def create_user(db: Session, user: UserCreate):
    from app.models.user import Customer, Agent, Supervisor, Vendor, UserRole
    
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    # Generate default avatar URL
    avatar_url = f"https://api.dicebear.com/7.x/avataaars/svg?seed={user.full_name.replace(' ', '')}"
    db_user = User(
        email=user.email,
        password=hashed_password,
        full_name=user.full_name,
        role=user.role,
        avatar=avatar_url
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create role-specific profile
    if user.role == UserRole.CUSTOMER:
        profile = Customer(user_id=db_user.id)
        db.add(profile)
    elif user.role == UserRole.AGENT:
        profile = Agent(user_id=db_user.id)
        db.add(profile)
    elif user.role == UserRole.SUPERVISOR:
        profile = Supervisor(user_id=db_user.id)
        db.add(profile)
    elif user.role == UserRole.VENDOR:
        profile = Vendor(user_id=db_user.id)
        db.add(profile)
    
    db.commit()
    return db_user

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def create_access_token_for_user(user: User):
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    return access_token
