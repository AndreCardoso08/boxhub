"""Example usage of the BoxHub user registration system."""

from src.user_registration import UserRegistration


def main():
    """Demonstrate user registration functionality."""
    print("=== BoxHub User Registration Example ===\n")
    
    # Create a registration instance
    registration = UserRegistration()
    
    # Example 1: Successful registration
    print("Example 1: Registering a valid user")
    result = registration.register_user(
        username="john_doe",
        email="john@example.com",
        password="SecurePass123!"
    )
    
    if result['success']:
        print(f"✓ User '{result['user']['username']}' registered successfully!")
        print(f"  Email: {result['user']['email']}")
        print(f"  Created at: {result['user']['created_at']}")
    else:
        print(f"✗ Registration failed: {result['error']}")
    
    print()
    
    # Example 2: Try to register with duplicate username
    print("Example 2: Attempting to register with duplicate username")
    result = registration.register_user(
        username="john_doe",
        email="another@example.com",
        password="AnotherPass123!"
    )
    
    if result['success']:
        print(f"✓ User '{result['user']['username']}' registered successfully!")
    else:
        print(f"✗ Registration failed: {result['error']}")
    
    print()
    
    # Example 3: Invalid email
    print("Example 3: Attempting to register with invalid email")
    result = registration.register_user(
        username="jane_doe",
        email="invalid-email",
        password="SecurePass123!"
    )
    
    if result['success']:
        print(f"✓ User '{result['user']['username']}' registered successfully!")
    else:
        print(f"✗ Registration failed: {result['error']}")
    
    print()
    
    # Example 4: Weak password
    print("Example 4: Attempting to register with weak password")
    result = registration.register_user(
        username="bob_smith",
        email="bob@example.com",
        password="weak"
    )
    
    if result['success']:
        print(f"✓ User '{result['user']['username']}' registered successfully!")
    else:
        print(f"✗ Registration failed: {result['error']}")
    
    print()
    
    # Example 5: Successfully register another user
    print("Example 5: Registering another valid user")
    result = registration.register_user(
        username="alice_wonder",
        email="alice@example.com",
        password="MyPassword456!"
    )
    
    if result['success']:
        print(f"✓ User '{result['user']['username']}' registered successfully!")
        print(f"  Email: {result['user']['email']}")
        print(f"  Created at: {result['user']['created_at']}")
    else:
        print(f"✗ Registration failed: {result['error']}")
    
    print()
    
    # Example 6: Retrieve user information
    print("Example 6: Retrieving user information")
    user_info = registration.get_user("john_doe")
    if user_info:
        print(f"✓ Found user: {user_info['username']}")
        print(f"  Email: {user_info['email']}")
        print(f"  Created at: {user_info['created_at']}")
    else:
        print("✗ User not found")
    
    print("\n=== End of Examples ===")


if __name__ == "__main__":
    main()
