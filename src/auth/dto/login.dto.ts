/**
 * Login DTO (Data Transfer Object)
 *
 * Defines the structure of data expected from the login endpoint.
 * DTOs help validate and type-check incoming request data.
 */
export class LoginDto {
  /**
   * Username of the account
   */
  username: string;

  /**
   * Password of the account
   */
  password: string;
}
