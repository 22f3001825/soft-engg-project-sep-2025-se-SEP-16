from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, Token, UserResponse
from app.services.auth import authenticate_user, create_user, create_access_token_for_user

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/register", response_model=Token)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    db_user = create_user(db, user)
    access_token = create_access_token_for_user(db_user)
    return Token(access_token=access_token, token_type="bearer", user={"id": db_user.id, "email": db_user.email, "full_name": db_user.full_name, "role": db_user.role.value})

@router.post("/login", response_model=Token)
async def login(
    username: str = Form(...),
    password: str = Form(...),
    role: str = Form(...),
    db: Session = Depends(get_db)
):
    """Login user"""
    user = authenticate_user(db, username, password, role)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token_for_user(user)
    return Token(access_token=access_token, token_type="bearer", user={"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role.value})

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(db: Session = Depends(get_db)):
    """Get current user info"""
    from app.services.auth import get_current_user
    user = get_current_user(db=db)
    return {"email": user.email, "full_name": user.full_name, "role": user.role.value}
