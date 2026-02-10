/**
 * Register DTO (Data Transfer Object)
 *
 * Defines the structure of data expected from the registration endpoint.
 * DTOs are used to validate and transform incoming request data.
 */
export class RegisterDto {
  /**
   * Username for the new account
   * Must be at least 3 characters and unique
   */
  username: string;

  /**
   * Password for the new account
   * Must be at least 6 characters for security
   */
  password: string;
}
