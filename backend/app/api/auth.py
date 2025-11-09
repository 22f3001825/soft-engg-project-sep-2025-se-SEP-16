from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, Token
from app.services.auth import authenticate_user, create_user, create_access_token_for_user

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/register", response_model=Token)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    db_user = create_user(db, user)
    access_token = create_access_token_for_user(db_user)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token_for_user(user)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=None)
async def get_current_user_info(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current user info"""
    from app.services.auth import get_current_user
    user = get_current_user(db, token)
    return {"email": user.email, "name": user.name, "role": user.role}
