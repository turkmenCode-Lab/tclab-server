/**
 * Password Utility Functions
 *
 * In production, use bcrypt library: npm install bcrypt
 * For this demo, we use a simplified hash function
 *
 * IMPORTANT: Never use this in production! Always use bcrypt or similar for real applications.
 */

/**
 * Simple hash function for demonstration purposes only
 * In production, replace with bcrypt.hash()
 *
 * @param password - The plain text password to hash
 * @returns A hashed version of the password
 */
export async function hashPassword(password: string): Promise<string> {
  // In production, use: return await bcrypt.hash(password, 10);
  // This simple implementation is just for demo purposes
  return Buffer.from(password).toString('base64');
}

/**
 * Compare a plain text password with a hashed password
 * In production, replace with bcrypt.compare()
 *
 * @param password - The plain text password to check
 * @param hashedPassword - The hashed password to compare against
 * @returns True if passwords match, false otherwise
 */
export async function comparePasswords(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  // In production, use: return await bcrypt.compare(password, hashedPassword);
  // This simple implementation is just for demo purposes
  const hashed = Buffer.from(password).toString('base64');
  return hashed === hashedPassword;
}
