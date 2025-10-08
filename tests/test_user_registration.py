"""Tests for user registration functionality."""

import unittest
import os
import json
from src.user_registration import UserRegistration


class TestUserRegistration(unittest.TestCase):
    """Test cases for UserRegistration class."""

    def setUp(self):
        """Set up test fixtures."""
        self.test_storage = "test_users.json"
        self.registration = UserRegistration(storage_file=self.test_storage)

    def tearDown(self):
        """Clean up test files."""
        if os.path.exists(self.test_storage):
            os.remove(self.test_storage)

    def test_successful_registration(self):
        """Test successful user registration."""
        result = self.registration.register_user(
            username="testuser",
            email="test@example.com",
            password="TestPass123!"
        )
        
        self.assertTrue(result['success'])
        self.assertEqual(result['user']['username'], "testuser")
        self.assertEqual(result['user']['email'], "test@example.com")
        self.assertIn('created_at', result['user'])

    def test_username_too_short(self):
        """Test registration with username that's too short."""
        result = self.registration.register_user(
            username="ab",
            email="test@example.com",
            password="TestPass123!"
        )
        
        self.assertFalse(result['success'])
        self.assertIn("at least 3 characters", result['error'])

    def test_username_invalid_characters(self):
        """Test registration with invalid username characters."""
        result = self.registration.register_user(
            username="test-user!",
            email="test@example.com",
            password="TestPass123!"
        )
        
        self.assertFalse(result['success'])
        self.assertIn("letters, numbers, and underscores", result['error'])

    def test_duplicate_username(self):
        """Test registration with duplicate username."""
        # First registration
        self.registration.register_user(
            username="testuser",
            email="test1@example.com",
            password="TestPass123!"
        )
        
        # Attempt duplicate
        result = self.registration.register_user(
            username="testuser",
            email="test2@example.com",
            password="TestPass123!"
        )
        
        self.assertFalse(result['success'])
        self.assertIn("already exists", result['error'])

    def test_invalid_email_format(self):
        """Test registration with invalid email format."""
        result = self.registration.register_user(
            username="testuser",
            email="invalid-email",
            password="TestPass123!"
        )
        
        self.assertFalse(result['success'])
        self.assertIn("Invalid email format", result['error'])

    def test_duplicate_email(self):
        """Test registration with duplicate email."""
        # First registration
        self.registration.register_user(
            username="user1",
            email="test@example.com",
            password="TestPass123!"
        )
        
        # Attempt duplicate email
        result = self.registration.register_user(
            username="user2",
            email="test@example.com",
            password="TestPass123!"
        )
        
        self.assertFalse(result['success'])
        self.assertIn("already registered", result['error'])

    def test_weak_password(self):
        """Test registration with weak password."""
        result = self.registration.register_user(
            username="testuser",
            email="test@example.com",
            password="weak"
        )
        
        self.assertFalse(result['success'])
        self.assertIn("at least 8 characters", result['error'])

    def test_password_missing_uppercase(self):
        """Test password validation - missing uppercase letter."""
        result = self.registration.register_user(
            username="testuser",
            email="test@example.com",
            password="testpass123!"
        )
        
        self.assertFalse(result['success'])
        self.assertIn("uppercase letter", result['error'])

    def test_password_missing_lowercase(self):
        """Test password validation - missing lowercase letter."""
        result = self.registration.register_user(
            username="testuser",
            email="test@example.com",
            password="TESTPASS123!"
        )
        
        self.assertFalse(result['success'])
        self.assertIn("lowercase letter", result['error'])

    def test_password_missing_digit(self):
        """Test password validation - missing digit."""
        result = self.registration.register_user(
            username="testuser",
            email="test@example.com",
            password="TestPassword!"
        )
        
        self.assertFalse(result['success'])
        self.assertIn("digit", result['error'])

    def test_get_user(self):
        """Test retrieving user information."""
        # Register a user
        self.registration.register_user(
            username="testuser",
            email="test@example.com",
            password="TestPass123!"
        )
        
        # Retrieve user
        user = self.registration.get_user("testuser")
        
        self.assertIsNotNone(user)
        self.assertEqual(user['username'], "testuser")
        self.assertEqual(user['email'], "test@example.com")
        self.assertNotIn('password_hash', user)

    def test_get_nonexistent_user(self):
        """Test retrieving non-existent user."""
        user = self.registration.get_user("nonexistent")
        self.assertIsNone(user)

    def test_data_persistence(self):
        """Test that user data persists to file."""
        # Register a user
        self.registration.register_user(
            username="testuser",
            email="test@example.com",
            password="TestPass123!"
        )
        
        # Verify file was created
        self.assertTrue(os.path.exists(self.test_storage))
        
        # Load new instance
        new_registration = UserRegistration(storage_file=self.test_storage)
        user = new_registration.get_user("testuser")
        
        self.assertIsNotNone(user)
        self.assertEqual(user['username'], "testuser")


if __name__ == '__main__':
    unittest.main()
