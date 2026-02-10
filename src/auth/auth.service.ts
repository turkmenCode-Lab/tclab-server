import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  hashPassword,
  comparePasswords,
} from './utils/password.util';

/**
 * Authentication Service
 *
 * Handles user registration, login, and authentication logic.
 * In a real application, this would interact with a database.
 * For this demo, we use an in-memory array to simulate a database.
 */
@Injectable()
export class AuthService {
  /**
   * In-memory database of users
   * In production, this would be replaced with a real database (TypeORM, Prisma, etc.)
   */
  private users: User[] = [];

  /**
   * Auto-incrementing ID for new users
   * In production, databases handle this automatically
   */
  private nextUserId = 1;

  /**
   * Register a new user
   *
   * Steps:
   * 1. Validate that username is not already taken
   * 2. Validate that password meets security requirements
   * 3. Hash the password (never store plain text!)
   * 4. Create and store the new user
   * 5. Return the created user (without password)
   *
   * @param registerDto - Contains username and password from the request
   * @returns The newly created user object (password excluded for security)
   * @throws BadRequestException if username already exists or validation fails
   */
  async register(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
    const { username, password } = registerDto;

    // Validate: Username must not be empty
    if (!username || username.trim().length === 0) {
      throw new BadRequestException('Username is required');
    }

    // Validate: Username must be at least 3 characters
    if (username.length < 3) {
      throw new BadRequestException(
        'Username must be at least 3 characters long',
      );
    }

    // Validate: Password must not be empty
    if (!password || password.trim().length === 0) {
      throw new BadRequestException('Password is required');
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

  /**
   * Authenticate a user with username and password
   *
   * Steps:
   * 1. Find the user by username
   * 2. Compare the provided password with the stored hashed password
   * 3. Return the user if credentials are valid
   * 4. Throw error if credentials are invalid
   *
   * @param loginDto - Contains username and password from the request
   * @returns The user object if authentication succeeds (password excluded)
   * @throws UnauthorizedException if credentials are invalid
   */
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

  /**
   * Find a user by their ID
   * Useful for other operations that need to fetch user details
   *
   * @param id - The user's ID
   * @returns The user if found, null otherwise
   */
  findUserById(id: number): Omit<User, 'password'> | null {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
