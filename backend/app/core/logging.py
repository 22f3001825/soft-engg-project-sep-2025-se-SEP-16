"""
Logging configuration for the Intellica Customer Support System.

This module provides centralized logging configuration with different log levels
and formatters for development and production environments.
"""

import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler

def setup_logging():
    """
    Configure logging for the application.
    
    Sets up both console and file logging with appropriate formatters
    and log levels for different components of the system.
    """
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Configure root logger
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            # Console handler for development
            logging.StreamHandler(sys.stdout),
            # File handler for persistent logging
            RotatingFileHandler(
                log_dir / "intellica.log",
                maxBytes=10*1024*1024,  # 10MB
                backupCount=5
            )
        ]
    )
    
    # Configure specific loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    
    return logging.getLogger("intellica")

# Global logger instance
logger = setup_logging()