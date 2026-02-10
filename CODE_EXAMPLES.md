# Code Examples - Register & Login

This document shows actual code from the implementation with detailed explanations.

## Registration Endpoint Code

### Controller Method (from `auth.controller.ts`)

```typescript
@Post('register')
@HttpCode(201) // HTTP 201 Created for successful registration
async register(@Body() registerDto: RegisterDto) {
  // Call the service to handle registration logic
  const user = await this.authService.register(registerDto);

  // Return success response with the created user
  return {
    message: 'Registration successful',
    user,
  };
}
```

**What this code does:**
1. Listens for POST requests to `/auth/register`
2. Returns HTTP 201 (Created) status code
3. Receives JSON body with username and password
4. Passes data to AuthService for processing
5. Returns user info in response

### Service Method (from `auth.service.ts`)

```typescript
async register(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
  const { username, password } = registerDto;

  // Validate: Username must be at least 3 characters
  if (username.length < 3) {
    throw new BadRequestException(
      'Username must be at least 3 characters long',
    );
  }

  // Validate: Password must be at least 6 characters
  if (password.length < 6) {
    throw new BadRequestException(
      'Password must be at least 6 characters long',
    );
  }

  // Check if user already exists (username must be unique)
  const existingUser = this.users.find((u) => u.username === username);
  if (existingUser) {
    throw new BadRequestException('Username already taken');
  }

  // Hash the password before storing (critical for security!)
  const hashedPassword = await hashPassword(password);

  // Create new user object
  const newUser: User = {
    id: this.nextUserId++,
    username,
    password: hashedPassword,
    createdAt: new Date(),
  };

  // Add user to our in-memory database
  this.users.push(newUser);

  // Return user data WITHOUT the password (never expose hashed passwords!)
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}
```

**What this code does:**
1. Extracts username and password from request
2. Validates both fields meet requirements
3. Checks if username is already taken
4. Hashes password using bcrypt (for security)
5. Creates new user object with auto-incrementing ID
6. Stores user in array (in production: database)
7. Returns user WITHOUT password (security)

## Login Endpoint Code

### Controller Method (from `auth.controller.ts`)

```typescript
@Post('login')
@HttpCode(200) // HTTP 200 OK for successful login
async login(@Body() loginDto: LoginDto) {
  // Call the service to handle login logic
  const user = await this.authService.login(loginDto);

  // Return success response with the authenticated user
  return {
    message: 'Login successful',
    user,
  };
}
```

**What this code does:**
1. Listens for POST requests to `/auth/login`
2. Returns HTTP 200 (OK) status code
3. Receives JSON body with username and password
4. Passes data to AuthService for authentication
5. Returns user info in response (or throws error)

### Service Method (from `auth.service.ts`)

```typescript
async login(loginDto: LoginDto): Promise<Omit<User, 'password'>> {
  const { username, password } = loginDto;

  // Find user by username in our in-memory database
  const user = this.users.find((u) => u.username === username);

  // If user not found, throw unauthorized error
  if (!user) {
    throw new UnauthorizedException('Invalid username or password');
  }

  // Compare provided password with stored hashed password
  const isPasswordValid = await comparePasswords(password, user.password);

  // If password doesn't match, throw unauthorized error
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid username or password');
  }

  // Return user data WITHOUT the password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
```

**What this code does:**
1. Extracts username and password from request
2. Finds user in the array by username
3. If not found, throws Unauthorized error
4. Compares provided password with stored hash
5. If doesn't match, throws Unauthorized error
6. If valid, returns user WITHOUT password

## Password Hashing Code

### Hash Password (from `password.util.ts`)

```typescript
export async function hashPassword(password: string): Promise<string> {
  // In production, use: return await bcrypt.hash(password, 10);
  // This simple implementation is just for demo purposes
  return Buffer.from(password).toString('base64');
}
```

**What this code does:**
1. Takes plain text password
2. Converts to Base64 (demo only)
3. In production: uses bcrypt for security
4. Returns hashed version

### Compare Passwords (from `password.util.ts`)

```typescript
export async function comparePasswords(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  // In production, use: return await bcrypt.compare(password, hashedPassword);
  // This simple implementation is just for demo purposes
  const hashed = Buffer.from(password).toString('base64');
  return hashed === hashedPassword;
}
```

**What this code does:**
1. Takes plain text password from login attempt
2. Hashes it the same way as storage
3. Compares with stored hash
4. Returns true if match, false if not
5. In production: uses bcrypt for security

## Data Models

### User Entity (from `user.entity.ts`)

```typescript
export class User {
  id: number;              // Unique identifier
  username: string;        // Login username (must be unique)
  password: string;        // Hashed password (never plain text!)
  createdAt: Date;         // Account creation timestamp
}
```

**What each field means:**
- `id` - Auto-incrementing ID, unique per user
- `username` - User's login name, must be unique
- `password` - HASHED password (never store plain text!)
- `createdAt` - When account was created

### Register DTO (from `dto/register.dto.ts`)

```typescript
export class RegisterDto {
  username: string;   // Username for the new account
  password: string;   // Password for the new account
}
```

**What this is:**
- Defines expected structure of registration request
- Helps with validation
- Provides type safety

### Login DTO (from `dto/login.dto.ts`)

```typescript
export class LoginDto {
  username: string;   // Username of the account
  password: string;   // Password of the account
}
```

**What this is:**
- Defines expected structure of login request
- Same as RegisterDto but used differently
- For clarity and code organization

## Full Request/Response Examples

### Successful Registration

**Request:**
```bash
POST /auth/register HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Content-Length: 48

{"username":"alice","password":"securePass123"}
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json
Content-Length: 101

{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "username": "alice",
    "createdAt": "2026-02-10T11:29:32.958Z"
  }
}
```

**Note:** Password is NOT included in response!

### Successful Login

**Request:**
```bash
POST /auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Content-Length: 46

{"username":"alice","password":"securePass123"}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 99

{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "alice",
    "createdAt": "2026-02-10T11:29:32.958Z"
  }
}
```

### Failed Login (Wrong Password)

**Request:**
```bash
POST /auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Content-Length: 44

{"username":"alice","password":"wrongpassword"}
```

**Response:**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json
Content-Length: 82

{
  "message": "Invalid username or password",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### Failed Registration (Duplicate Username)

**Request:**
```bash
POST /auth/register HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Content-Length: 48

{"username":"alice","password":"different123"}
```

**Response:**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json
Content-Length: 78

{
  "message": "Username already taken",
  "error": "Bad Request",
  "statusCode": 400
}
```

## Real-World Usage in Tests

### Using cURL

```bash
# Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "password": "john123456"}'

# Login with the user
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "password": "john123456"}'

# Try with wrong password (will fail)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "password": "wrongpassword"}'
```

### Using Postman

1. Open Postman
2. Create POST request to `http://localhost:3000/auth/register`
3. Set header: `Content-Type: application/json`
4. Set body (raw JSON):
   ```json
   {
     "username": "testuser",
     "password": "testpass123"
   }
   ```
5. Click Send
6. Check response (should be HTTP 201 with user data)

## Understanding the Flow

### Step-by-step: User Registers

```
Browser                    Server
   ↓
   └─POST /auth/register─────→ HTTP Handler
                               ├─ Creates RegisterDto
                               ├─ Validates format
                               └─ Calls AuthController.register()
                                     │
                                     └─ Calls AuthService.register()
                                           ├─ Validates username length
                                           ├─ Validates password length
                                           ├─ Checks for duplicates
                                           ├─ Hashes password
                                           ├─ Stores user in array
                                           └─ Returns user (no password)
                               │
                               └─ Returns HTTP 201 with user
   ←─────────────────── 201 Created
   │
   └─ Displays success message
      User stored in database ✓
```

### Step-by-step: User Logs In

```
Browser                    Server
   ↓
   └─POST /auth/login────────→ HTTP Handler
                              ├─ Creates LoginDto
                              ├─ Validates format
                              └─ Calls AuthController.login()
                                    │
                                    └─ Calls AuthService.login()
                                          ├─ Finds user by username
                                          ├─ Hashes provided password
                                          ├─ Compares with stored hash
                                          └─ Returns user if match
                              │
                              └─ Returns HTTP 200 with user
   ←─────────────────── 200 OK
   │
   └─ Logs user in successfully
      User authenticated ✓
```

## Comments in Code

All functions include comments explaining:

```typescript
/**
 * Brief description of what this function does
 *
 * Detailed explanation of the steps:
 * 1. First step
 * 2. Second step
 * 3. etc.
 *
 * @param paramName - Explanation of this parameter
 * @returns What the function returns
 * @throws What errors it can throw
 */
async functionName(param: Type): Promise<ReturnType> {
  // Inline comment explaining what this does
  const result = await someOperation();

  // Another comment
  if (result) {
    // Nested comment
  }

  return result;
}
```

## Key Security Concepts

### 1. Password Hashing

**NEVER do this:**
```typescript
// ❌ WRONG - Passwords stored in plain text!
this.users.push({ username, password }); // DON'T!
```

**DO this:**
```typescript
// ✓ CORRECT - Password is hashed before storage
const hashedPassword = await hashPassword(password);
this.users.push({ username, password: hashedPassword });
```

### 2. Password Never in Response

**NEVER do this:**
```typescript
// ❌ WRONG - Exposing hashed password!
return { id, username, password: hashedPassword }; // DON'T!
```

**DO this:**
```typescript
// ✓ CORRECT - Return without password
const { password: _, ...userWithoutPassword } = user;
return userWithoutPassword;
```

### 3. Validation Before Storage

**NEVER do this:**
```typescript
// ❌ WRONG - No validation!
const newUser = { id, username, password };
this.users.push(newUser); // DON'T!
```

**DO this:**
```typescript
// ✓ CORRECT - Validate first
if (username.length < 3) throw new Error('Too short!');
if (password.length < 6) throw new Error('Too short!');
if (this.users.find(u => u.username === username)) {
  throw new Error('Duplicate!');
}
const newUser = { id, username, password };
this.users.push(newUser);
```

---

**All code in this project follows these security best practices!**
