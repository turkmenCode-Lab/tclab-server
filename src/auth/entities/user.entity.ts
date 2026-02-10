/**
 * User Entity
 *
 * Represents a user in the application.
 * In a production app, this would be a TypeORM entity connected to a database.
 * For now, we simulate persistence in the AuthService.
 */
export class User {
  /**
   * Unique identifier for the user
   */
  id: number;

  /**
   * Username for login (must be unique)
   */
  username: string;

  /**
   * Hashed password (never store plain text passwords!)
   */
  password: string;

  /**
   * Timestamp when the user was created
   */
  createdAt: Date;
}
