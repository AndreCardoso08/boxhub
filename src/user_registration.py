"""User registration module for BoxHub."""

import re
import hashlib
import json
from datetime import datetime
from typing import Dict, Optional


class UserRegistration:
    """Handles user registration with validation."""

    def __init__(self, storage_file: str = "users.json"):
        """
        Initialize the UserRegistration system.
        
        Args:
            storage_file: Path to the file where user data will be stored
        """
        self.storage_file = storage_file
        self.users = self._load_users()

    def _load_users(self) -> Dict:
        """Load existing users from storage."""
        try:
            with open(self.storage_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}

    def _save_users(self) -> None:
        """Save users to storage."""
        with open(self.storage_file, 'w') as f:
            json.dump(self.users, f, indent=2)

    def _hash_password(self, password: str) -> str:
        """Hash a password using SHA-256."""
        return hashlib.sha256(password.encode()).hexdigest()

    def _validate_username(self, username: str) -> Optional[str]:
        """
        Validate username.
        
        Returns:
            Error message if invalid, None if valid
        """
        if not username:
            return "Username cannot be empty"
        if len(username) < 3:
            return "Username must be at least 3 characters long"
        if len(username) > 20:
            return "Username must not exceed 20 characters"
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            return "Username can only contain letters, numbers, and underscores"
        if username in self.users:
            return "Username already exists"
        return None

    def _validate_email(self, email: str) -> Optional[str]:
        """
        Validate email address.
        
        Returns:
            Error message if invalid, None if valid
        """
        if not email:
            return "Email cannot be empty"
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return "Invalid email format"
        # Check if email already exists
        for user_data in self.users.values():
            if user_data.get('email') == email:
                return "Email already registered"
        return None

    def _validate_password(self, password: str) -> Optional[str]:
        """
        Validate password strength.
        
        Returns:
            Error message if invalid, None if valid
        """
        if not password:
            return "Password cannot be empty"
        if len(password) < 8:
            return "Password must be at least 8 characters long"
        if not re.search(r'[A-Z]', password):
            return "Password must contain at least one uppercase letter"
        if not re.search(r'[a-z]', password):
            return "Password must contain at least one lowercase letter"
        if not re.search(r'[0-9]', password):
            return "Password must contain at least one digit"
        return None

    def register_user(self, username: str, email: str, password: str) -> Dict:
        """
        Register a new user.
        
        Args:
            username: Desired username
            email: User's email address
            password: User's password
            
        Returns:
            Dictionary with 'success' boolean and either 'user' data or 'error' message
        """
        # Validate inputs
        username_error = self._validate_username(username)
        if username_error:
            return {'success': False, 'error': username_error}

        email_error = self._validate_email(email)
        if email_error:
            return {'success': False, 'error': email_error}

        password_error = self._validate_password(password)
        if password_error:
            return {'success': False, 'error': password_error}

        # Create user
        user_data = {
            'username': username,
            'email': email,
            'password_hash': self._hash_password(password),
            'created_at': datetime.now().isoformat()
        }

        self.users[username] = user_data
        self._save_users()

        # Return success without password hash
        return {
            'success': True,
            'user': {
                'username': username,
                'email': email,
                'created_at': user_data['created_at']
            }
        }

    def get_user(self, username: str) -> Optional[Dict]:
        """
        Get user information (without password hash).
        
        Args:
            username: Username to look up
            
        Returns:
            User data dictionary or None if not found
        """
        user_data = self.users.get(username)
        if user_data:
            return {
                'username': user_data['username'],
                'email': user_data['email'],
                'created_at': user_data['created_at']
            }
        return None
