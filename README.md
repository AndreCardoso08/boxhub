# boxhub

A simple user registration system.

## Features

- User registration with username, email, and password
- Input validation
- Secure password handling

## Installation

```bash
pip install -r requirements.txt
```

## Usage

```python
from src.user_registration import UserRegistration

# Create a registration instance
registration = UserRegistration()

# Register a new user
result = registration.register_user(
    username="john_doe",
    email="john@example.com",
    password="SecurePass123!"
)

if result['success']:
    print(f"User {result['user']['username']} registered successfully!")
else:
    print(f"Registration failed: {result['error']}")
```

## Running the Example

```bash
python example.py
```
