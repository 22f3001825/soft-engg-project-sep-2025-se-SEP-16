"""
Input validation and sanitization utilities for the Intellica Customer Support System.

This module provides enhanced validation functions to ensure data integrity
and security across all API endpoints.
"""

import re
import html
from typing import Optional, List
from fastapi import HTTPException

def sanitize_string(value: str, max_length: int = 1000) -> str:
    """
    Sanitize string input by removing HTML tags and limiting length.
    
    Args:
        value: The string to sanitize
        max_length: Maximum allowed length for the string
        
    Returns:
        Sanitized string
        
    Raises:
        HTTPException: If string exceeds maximum length
    """
    if not value:
        return ""
    
    # Remove HTML tags and decode HTML entities
    sanitized = html.escape(value.strip())
    
    # Check length
    if len(sanitized) > max_length:
        raise HTTPException(
            status_code=400, 
            detail=f"Input too long. Maximum {max_length} characters allowed."
        )
    
    return sanitized

def validate_email(email: str) -> str:
    """
    Validate and sanitize email address.
    
    Args:
        email: Email address to validate
        
    Returns:
        Validated email address
        
    Raises:
        HTTPException: If email format is invalid
    """
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    email = email.strip().lower()
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(email_pattern, email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    return email

def validate_uuid(uuid_string: str) -> str:
    """
    Validate UUID format.
    
    Args:
        uuid_string: UUID string to validate
        
    Returns:
        Validated UUID string
        
    Raises:
        HTTPException: If UUID format is invalid
    """
    if not uuid_string:
        raise HTTPException(status_code=400, detail="ID is required")
    
    uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    
    if not re.match(uuid_pattern, uuid_string.lower()):
        raise HTTPException(status_code=400, detail="Invalid ID format")
    
    return uuid_string.lower()

def validate_file_upload(filename: str, file_size: int, allowed_extensions: List[str]) -> None:
    """
    Validate file upload parameters.
    
    Args:
        filename: Name of the uploaded file
        file_size: Size of the file in bytes
        allowed_extensions: List of allowed file extensions
        
    Raises:
        HTTPException: If file validation fails
    """
    if not filename:
        raise HTTPException(status_code=400, detail="Filename is required")
    
    # Check file extension
    file_ext = filename.lower().split('.')[-1] if '.' in filename else ''
    if f'.{file_ext}' not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Check file size (10MB max)
    max_size = 10 * 1024 * 1024
    if file_size > max_size:
        raise HTTPException(
            status_code=400, 
            detail=f"File too large. Maximum size: {max_size // (1024*1024)}MB"
        )

def sanitize_search_query(query: str) -> str:
    """
    Sanitize search query to prevent injection attacks.
    
    Args:
        query: Search query string
        
    Returns:
        Sanitized search query
    """
    if not query:
        return ""
    
    # Remove special characters that could be used for injection
    sanitized = re.sub(r'[<>"\';\\]', '', query.strip())
    
    # Limit length
    return sanitized[:100]