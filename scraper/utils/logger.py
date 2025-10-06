"""
Simple logger for scraper operations.
"""
from datetime import datetime
from typing import Any


class Logger:
    def __init__(self, name: str = "scraper"):
        self.name = name
    
    def info(self, message: str, **kwargs: Any):
        """Log info message."""
        timestamp = datetime.now().strftime("%H:%M:%S")
        extra = f" {kwargs}" if kwargs else ""
        print(f"[{timestamp}] ℹ️  {message}{extra}")
    
    def success(self, message: str, **kwargs: Any):
        """Log success message."""
        timestamp = datetime.now().strftime("%H:%M:%S")
        extra = f" {kwargs}" if kwargs else ""
        print(f"[{timestamp}] ✅ {message}{extra}")
    
    def warn(self, message: str, **kwargs: Any):
        """Log warning message."""
        timestamp = datetime.now().strftime("%H:%M:%S")
        extra = f" {kwargs}" if kwargs else ""
        print(f"[{timestamp}] ⚠️  {message}{extra}")
    
    def error(self, message: str, error: Exception = None, **kwargs: Any):
        """Log error message."""
        timestamp = datetime.now().strftime("%H:%M:%S")
        error_msg = f": {error}" if error else ""
        extra = f" {kwargs}" if kwargs else ""
        print(f"[{timestamp}] ❌ {message}{error_msg}{extra}")
