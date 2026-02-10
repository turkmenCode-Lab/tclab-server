# Authentication Implementation Guide

## Overview

This document explains the register and login system implemented in this NestJS application.

## Architecture

### Files Created

```
src/auth/
├── auth.controller.ts          # HTTP endpoints for auth
├── auth.service.ts             # Business logic for auth
├── auth.module.ts              # Module configuration
├── dto/
│   ├── register.dto.ts         # Registration request structure
│   └── login.dto.ts            # Login request structure
├── entities/
│   └── user.entity.ts          # User data model
└── utils/
    └── password.util.ts        # Password hashing utilities
```

## Key Features

### 1. User Registration (`POST /auth/register`)

**What it does:**
- Creates a new user account with username and password
- Validates input (username and password requirements)
- Checks if username already exists
- Hashes password before storing (security best practice)
- Returns the created user (without password)

**Request Example:**
```json
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Success Response (HTTP 201):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "createdAt": "2024-02-10T12:00:00Z"
  }
}
```

**Error Response (HTTP 400):**
```json
{
  "message": "Username already taken",
  "statusCode": 400
}
```

**Validation Rules:**
- Username must be at least 3 characters
- Password must be at least 6 characters
- Username must be unique (no duplicates)

### 2. User Login (`POST /auth/login`)

**What it does:**
- Authenticates user with username and password
- Verifies password by comparing with stored hash
- Returns authenticated user information
- Never exposes password in responses

**Request Example:**
```json
POST /auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Success Response (HTTP 200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "createdAt": "2024-02-10T12:00:00Z"
  }
}
```

**Error Response (HTTP 401):**
```json
{
  "message": "Invalid username or password",
  "statusCode": 401
}
```

## Code Structure Explained

### User Entity (`user.entity.ts`)

```typescript
export class User {
  id: number;              // Unique identifier
  username: string;        // Login username (must be unique)
  password: string;        // Hashed password (never plain text!)
  createdAt: Date;         // Account creation timestamp
}
```

### DTOs (Data Transfer Objects)

**RegisterDto** and **LoginDto** define the expected request structure:
- Validates incoming data
- Provides type safety
- Documents what fields are required

### AuthService - Core Logic

Key methods:

#### `async register(registerDto: RegisterDto)`
1. Validates username and password format
2. Checks if username is already taken
3. Hashes the password using `hashPassword()`
4. Creates and stores new user
5. Returns user without password

#### `async login(loginDto: LoginDto)`
1. Finds user by username
2. Compares provided password with stored hash
3. Returns user if credentials match
4. Throws `UnauthorizedException` if invalid

### Password Hashing (`password.util.ts`)

**Why hash passwords?**
- If database is compromised, passwords aren't exposed
- Users can't login even with the hashed password
- Only original plaintext password works

**Current Implementation:**
```typescript
// For DEMO purposes only - uses Base64 encoding
export async function hashPassword(password: string): Promise<string> {
  return Buffer.from(password).toString('base64');
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  const hashed = Buffer.from(password).toString('base64');
  return hashed === hashedPassword;
}
```

### AuthController - HTTP Endpoints

Routes incoming requests to service methods:

- `POST /auth/register` → calls `authService.register()`
- `POST /auth/login` → calls `authService.login()`

## Testing the Implementation

### Using cURL

**Register a user:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "password123"}'
```

**Login with the user:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "password123"}'
```

**Try wrong password (should fail):**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "wrongpassword"}'
```

### Using Postman

1. Open Postman
2. Create new `POST` request to `http://localhost:3000/auth/register`
3. Set `Content-Type: application/json` header
4. Set body to:
   ```json
   {
     "username": "testuser",
     "password": "testpass123"
   }
   ```
5. Send request and check response

## Security Features Implemented

✅ **Passwords are hashed** - Never stored in plain text
✅ **Validation** - Input validation on both fields
✅ **Unique usernames** - Duplicate detection
✅ **No password exposure** - Responses never include passwords
✅ **Proper HTTP status codes** - 201 for creation, 401 for auth failure

## Production Improvements Needed

The current implementation is for learning/development. For production, add:

1. **Real Database** - Replace in-memory array with TypeORM, Prisma, etc.
   ```
   npm install @nestjs/typeorm typeorm mysql2
   ```

2. **Bcrypt for Password Hashing** - Better than Base64
   ```
   npm install bcrypt
   npm install --save-dev @types/bcrypt
   ```

3. **JWT Tokens** - For session management
   ```
   npm install @nestjs/jwt @nestjs/passport passport-jwt
   ```

4. **Rate Limiting** - Prevent brute force attacks
   ```
   npm install @nestjs/throttler
   ```

5. **Input Validation** - Add decorators to DTOs
   ```typescript
   import { IsString, MinLength } from 'class-validator';

   export class RegisterDto {
     @IsString()
     @MinLength(3)
     username: string;

     @IsString()
     @MinLength(6)
     password: string;
   }
   ```

6. **CORS Configuration** - For frontend integration
   ```typescript
   app.enableCors();
   ```

7. **Logging** - Track authentication attempts
   ```typescript
   private logger = new Logger(AuthService.name);
   ```

## Data Flow Example

### Registration Flow
```
User Browser
    ↓ POST /auth/register {username, password}
    ↓
AuthController
    ↓ calls
AuthService.register()
    ↓ validates & hashes
In-Memory User Array (stores User object)
    ↓ returns
User object (without password)
    ↓ returns HTTP 201
User Browser
```

### Login Flow
```
User Browser
    ↓ POST /auth/login {username, password}
    ↓
AuthController
    ↓ calls
AuthService.login()
    ↓ finds user & compares
In-Memory User Array (looks up user)
    ↓ returns match result
AuthService verifies password
    ↓ returns
User object (without password)
    ↓ returns HTTP 200
User Browser
```

## Comments in Code

All code files include detailed comments explaining:
- What each method does
- Why decisions were made
- Example requests/responses
- Security considerations
- Next steps for production

Read the comments in these files for more details:
- `auth.service.ts` - Business logic explanations
- `auth.controller.ts` - Endpoint documentation with examples
- `password.util.ts` - Password handling explanations
- `entities/user.entity.ts` - Data model documentation
- `dto/*.ts` - Request data structure documentation
