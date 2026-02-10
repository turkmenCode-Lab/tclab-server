import { Body, Controller, Post, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/**
 * Authentication Controller
 *
 * Handles HTTP requests related to authentication.
 * Routes: POST /auth/register and POST /auth/login
 *
 * In a production app, this would also return JWT tokens.
 */
@Controller('auth')
export class AuthController {
  /**
   * Inject the AuthService via dependency injection
   * This allows us to use authentication methods in our route handlers
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * User Registration Endpoint
   *
   * HTTP Method: POST
   * URL: /auth/register
   * Body: { username: string, password: string }
   *
   * What happens:
   * 1. Accept username and password from request body
   * 2. Validate the input (done in AuthService.register)
   * 3. Hash the password for security
   * 4. Store the new user
   * 5. Return the created user (without password)
   *
   * Example request:
   * POST /auth/register
   * {
   *   "username": "john_doe",
   *   "password": "securePassword123"
   * }
   *
   * Example response (success - HTTP 201):
   * {
   *   "id": 1,
   *   "username": "john_doe",
   *   "createdAt": "2024-02-10T12:00:00Z"
   * }
   *
   * Example response (error - HTTP 400):
   * {
   *   "message": "Username already taken",
   *   "statusCode": 400
   * }
   */
  @Post('register')
  @HttpCode(201) // HTTP 201 Created status code for successful registration
  async register(@Body() registerDto: RegisterDto) {
    // Call the service to handle registration logic
    const user = await this.authService.register(registerDto);

    // Return success response with the created user
    return {
      message: 'Registration successful',
      user,
    };
  }

  /**
   * User Login Endpoint
   *
   * HTTP Method: POST
   * URL: /auth/login
   * Body: { username: string, password: string }
   *
   * What happens:
   * 1. Accept username and password from request body
   * 2. Find the user and verify password (done in AuthService.login)
   * 3. Return user information on success
   * 4. Return error on failure (invalid credentials)
   *
   * Example request:
   * POST /auth/login
   * {
   *   "username": "john_doe",
   *   "password": "securePassword123"
   * }
   *
   * Example response (success - HTTP 200):
   * {
   *   "message": "Login successful",
   *   "user": {
   *     "id": 1,
   *     "username": "john_doe",
   *     "createdAt": "2024-02-10T12:00:00Z"
   *   }
   * }
   *
   * Example response (error - HTTP 401):
   * {
   *   "message": "Invalid username or password",
   *   "statusCode": 401
   * }
   *
   * NOTE: In production, this endpoint should also:
   * - Return a JWT token for authenticated requests
   * - Set httpOnly cookies for security
   * - Have rate limiting to prevent brute force attacks
   */
  @Post('login')
  @HttpCode(200) // HTTP 200 OK status code for successful login
  async login(@Body() loginDto: LoginDto) {
    // Call the service to handle login logic
    const user = await this.authService.login(loginDto);

    // Return success response with the authenticated user
    return {
      message: 'Login successful',
      user,
    };
  }
}
