# Quick Start Guide - Register & Login

Get up and running with the authentication system in 5 minutes.

## Prerequisites

- Node.js installed
- npm or yarn package manager
- A REST client (curl, Postman, or browser)

## 1. Start the Server

```bash
npm install
npm run build
npm start
```

You should see:
```
[Nest] 11120 - ... Starting Nest application...
[Nest] 11120 - ... Mapped {/auth/register, POST} route
[Nest] 11120 - ... Mapped {/auth/login, POST} route
[Nest] 11120 - ... Nest application successfully started
```

Server runs on `http://localhost:3000`

## 2. Register a User

Open a terminal and run:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "password123"}'
```

You should see:
```json
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "username": "alice",
    "createdAt": "2026-02-10T11:29:32.958Z"
  }
}
```

## 3. Login with That User

Run:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "password123"}'
```

You should see:
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "alice",
    "createdAt": "2026-02-10T11:29:32.958Z"
  }
}
```

## 4. Try Invalid Credentials

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "wrongpassword"}'
```

You should see error:
```json
{
  "message": "Invalid username or password",
  "error": "Unauthorized",
  "statusCode": 401
}
```

## 5. Try Duplicate Username

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "different123"}'
```

You should see error:
```json
{
  "message": "Username already taken",
  "error": "Bad Request",
  "statusCode": 400
}
```

## File Structure

All auth code is in `src/auth/`:

```
src/auth/
├── auth.controller.ts       ← HTTP endpoints
├── auth.service.ts          ← Business logic (heavily commented!)
├── auth.module.ts           ← Module setup
├── dto/
│   ├── register.dto.ts      ← Registration request structure
│   └── login.dto.ts         ← Login request structure
├── entities/
│   └── user.entity.ts       ← User data model
└── utils/
    └── password.util.ts     ← Password hashing (heavily commented!)
```

## Understanding the Comments

Open these files in your editor to read the extensive comments:

### Start Here:
1. **`src/auth/auth.service.ts`** (85 lines with comments)
   - Read the `register()` method - explains registration flow
   - Read the `login()` method - explains login flow
   - Understand why each validation exists

2. **`src/auth/auth.controller.ts`** (50 lines with comments)
   - Understand the HTTP endpoints
   - See example requests and responses
   - Learn what production needs

3. **`src/auth/utils/password.util.ts`** (30 lines with comments)
   - Understand password hashing
   - See why Base64 is demo-only
   - Learn about production use of bcrypt

## Key Validation Rules

**Username:**
- ✓ Must be 3+ characters
- ✓ Must be unique (no duplicates)

**Password:**
- ✓ Must be 6+ characters
- ✓ Always hashed before storage

## Testing with Different Tools

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "bob", "password": "pass123456"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "bob", "password": "pass123456"}'
```

### Using Postman

1. Create POST request to `http://localhost:3000/auth/register`
2. Go to "Body" tab → select "raw" → select "JSON"
3. Paste:
   ```json
   {
     "username": "testuser",
     "password": "testpass123"
   }
   ```
4. Click "Send"
5. Should get 201 response with user data

### Using VS Code REST Client Extension

Create file `test.http`:

```http
### Register
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "username": "alice",
  "password": "password123"
}

### Login
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "username": "alice",
  "password": "password123"
}

### Wrong password
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "username": "alice",
  "password": "wrongpassword"
}
```

Then click "Send Request" above each block.

## What Each File Does

| File | Purpose | Key Features |
|------|---------|--------------|
| `auth.service.ts` | Business logic | Register, login, validation, hashing |
| `auth.controller.ts` | HTTP endpoints | POST /auth/register, POST /auth/login |
| `user.entity.ts` | Data model | id, username, password, createdAt |
| `register.dto.ts` | Request structure | Defines registration payload |
| `login.dto.ts` | Request structure | Defines login payload |
| `password.util.ts` | Security | Hash and compare passwords |
| `auth.module.ts` | Module setup | Connects controller and service |

## HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 201 | Created | Registration successful |
| 200 | OK | Login successful |
| 400 | Bad Request | Username already taken, validation failed |
| 401 | Unauthorized | Invalid credentials on login |

## Common Issues

### "Cannot POST /auth/register"
- Server not running? Run `npm start`
- Wrong port? Check it's `http://localhost:3000`
- Wrong URL? Check it's `/auth/register` (not `/register`)

### "Password must be at least 6 characters long"
- Password too short. Use 6+ characters.

### "Username already taken"
- That username exists. Try a different one.

### Build errors?
- Run `npm install` first
- Then `npm run build`

## Next Steps for Production

When ready for production, follow the comments in the code for:

1. **Database Integration** (TypeORM, Prisma)
2. **Better Password Hashing** (bcrypt instead of Base64)
3. **JWT Tokens** (for session management)
4. **Input Validation** (class-validator decorators)
5. **Rate Limiting** (prevent brute force)
6. **CORS Setup** (for frontend integration)

All comments in the code point to these improvements!

## Code Walkthrough

The implementation is thoroughly commented. Open files in this order:

### 1. Understanding Registration
```typescript
// In auth.service.ts, find the register() method
// Read comments explaining:
// - Input validation
// - Duplicate checking
// - Password hashing
// - User creation
// - Security considerations
```

### 2. Understanding Login
```typescript
// In auth.service.ts, find the login() method
// Read comments explaining:
// - User lookup
// - Password verification
// - Security of the comparison
// - Response generation
```

### 3. Understanding HTTP Endpoints
```typescript
// In auth.controller.ts, read the comments
// explaining:
// - What POST /auth/register does
// - What POST /auth/login does
// - Example requests
// - Example responses
```

## Test Cases to Try

1. **Happy Path - Register**
   ```bash
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username": "carol", "password": "securepass123"}'
   ```
   Expected: 201 with user data

2. **Happy Path - Login**
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "carol", "password": "securepass123"}'
   ```
   Expected: 200 with user data

3. **Error - Wrong Password**
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "carol", "password": "wrongpass"}'
   ```
   Expected: 401 error

4. **Error - User Not Found**
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "nonexistent", "password": "password123"}'
   ```
   Expected: 401 error

5. **Error - Duplicate Username**
   ```bash
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username": "carol", "password": "different123"}'
   ```
   Expected: 400 error

6. **Error - Username Too Short**
   ```bash
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username": "ab", "password": "password123"}'
   ```
   Expected: 400 error

7. **Error - Password Too Short**
   ```bash
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username": "dave", "password": "pass"}'
   ```
   Expected: 400 error

## Summary

✅ **Register a user** - Creates account with validation
✅ **Login** - Authenticates with password verification
✅ **Error handling** - Clear error messages
✅ **Security** - Passwords hashed, never exposed
✅ **Comments** - Extensive comments explaining everything

**Everything is ready to use! Read the comments to understand how it works.**
