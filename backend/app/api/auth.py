"""Authentication API endpoints for the Intellica Customer Support System.

This module provides secure authentication for a third-party integration system with:
- User registration (new accounts will have no organizational data)
- User login with credential validation and JWT token generation
- Current user information retrieval
- Role-based access control

IMPORTANT: This is a third-party integration system. While you can register new accounts,
they will not have any organizational data. Use pre-seeded accounts for full functionality.

Pre-seeded Test Accounts (see README.md for complete list):
- Customer: ali.jawad@gmail.com (Password: customer123)
- Agent: emma.wilson@intellica.com (Password: agent123)
- Vendor: vendor@techmart.com (Password: vendor123)
- Supervisor: supervisor.demo@intellica.com (Password: demo2024)

All endpoints include proper validation, error handling, and logging.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, Token, UserResponse
from app.services.auth import authenticate_user, create_user, create_access_token_for_user, get_current_user
from app.models.user import User
from app.core.logging import logger
from app.core.validation import sanitize_string, validate_email

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/register", response_model=Token)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account with comprehensive validation.
    
    IMPORTANT: This is a third-party integration system. New registered accounts
    will not have any organizational data (orders, tickets, etc.). For full
    functionality with existing data, use pre-seeded accounts from README.md.
    
    This endpoint creates new user accounts with role-based permissions:
    - Validates email format and uniqueness
    - Sanitizes user input data
    - Creates appropriate role-specific profiles
    - Generates secure JWT access tokens
    
    Note: New accounts will have empty dashboards and no historical data.
    
    Args:
        user: User registration data (email, password, full_name, role)
        db: Database session dependency
        
    Returns:
        Token: JWT access token with user information
        
    Raises:
        HTTPException: 400 if email already exists or validation fails
        HTTPException: 500 if registration process fails
    """
    logger.info(f"User registration attempt for email: {user.email}")
    
    try:
        # Validate and sanitize input data
        if not validate_email(user.email):
            logger.warning(f"Invalid email format provided: {user.email}")
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        sanitized_name = sanitize_string(user.full_name, 100)
        if not sanitized_name:
            raise HTTPException(status_code=400, detail="Full name is required")
        
        # Update user object with sanitized data
        user.full_name = sanitized_name
        user.email = user.email.lower().strip()
        
        db_user = create_user(db, user)
        access_token = create_access_token_for_user(db_user)
        
        logger.info(f"User successfully registered: {db_user.id} ({user.email})")
        return Token(
            access_token=access_token, 
            token_type="bearer", 
            user={
                "id": db_user.id, 
                "email": db_user.email, 
                "full_name": db_user.full_name, 
                "role": db_user.role.value
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration failed for {user.email}: {str(e)}")
        if "UNIQUE constraint failed" in str(e) or "duplicate" in str(e).lower():
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=500, detail="Registration failed")

@router.post("/login", response_model=Token)
async def login(
    username: str = Form(..., description="User email address"),
    password: str = Form(..., description="User password"),
    role: str = Form(..., description="User role (CUSTOMER, AGENT, VENDOR, SUPERVISOR)"),
    db: Session = Depends(get_db)
):
    """
    Authenticate user and generate access token with comprehensive validation.
    
    This endpoint handles secure user authentication with:
    - Email and password validation
    - Role-based access verification
    - Account status checking (active/blocked)
    - Secure JWT token generation
    - Login attempt logging for security
    
    IMPORTANT: This is a third-party integration system. For full functionality
    with existing organizational data, use pre-seeded accounts (see README.md).
    New registered accounts will have empty dashboards.
    
    Args:
        username: User email address (validated format)
        password: User password (minimum security requirements)
        role: User role for role-based authentication (CUSTOMER, AGENT, VENDOR, SUPERVISOR)
        db: Database session dependency
        
    Returns:
        Token: JWT access token with user information
        
    Raises:
        HTTPException: 400 if input validation fails
        HTTPException: 401 if credentials are invalid
        HTTPException: 403 if account is blocked
        HTTPException: 500 if authentication process fails
    """
    logger.info(f"Login attempt for username: {username}, role: {role}")
    
    try:
        # Validate and sanitize input data
        username_clean = username.lower().strip() if username else ""
        if not validate_email(username_clean):
            logger.warning(f"Invalid email format in login attempt: {username}")
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        role_clean = sanitize_string(role, 20).upper() if role else ""
        if role_clean not in ["CUSTOMER", "AGENT", "VENDOR", "SUPERVISOR"]:
            logger.warning(f"Invalid role in login attempt: {role}")
            raise HTTPException(status_code=400, detail="Invalid role specified. Use: CUSTOMER, AGENT, VENDOR, or SUPERVISOR")
        
        if not password or len(password.strip()) < 1:
            raise HTTPException(status_code=400, detail="Password is required")
        
        user = authenticate_user(db, username_clean, password, role_clean)
        if not user:
            logger.warning(f"Failed login attempt for {username_clean} with role {role_clean}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user account is active
        if not user.is_active:
            logger.warning(f"Blocked user attempted login: {username_clean}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account has been blocked. Please contact support."
            )
        
        access_token = create_access_token_for_user(user)
        
        logger.info(f"Successful login for user: {user.id} ({username_clean})")
        return Token(
            access_token=access_token, 
            token_type="bearer", 
            user={
                "id": user.id, 
                "email": user.email, 
                "full_name": user.full_name, 
                "role": user.role.value
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login process failed for {username}: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve current authenticated user information.
    
    This endpoint provides secure access to the current user's profile data:
    - Validates JWT token authenticity
    - Returns user profile information
    - Ensures data privacy and security
    
    Args:
        current_user: Current authenticated user from JWT token
        
    Returns:
        UserResponse: Current user's email, full name, and role
        
    Raises:
        HTTPException: 401 if token is invalid or expired
        HTTPException: 404 if user not found
        HTTPException: 500 if retrieval process fails
    """
    try:
        logger.info(f"User info retrieved for user ID: {current_user.id}")
        return {
            "email": current_user.email, 
            "full_name": current_user.full_name, 
            "role": current_user.role.value
        }
        
    except Exception as e:
        logger.error(f"Error retrieving current user info: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve user information")
