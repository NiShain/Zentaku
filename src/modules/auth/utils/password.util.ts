import bcrypt from 'bcrypt';
import crypto from 'crypto';

export class PasswordUtil {
  private static readonly SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateRandomPassword(length: number = 32): string {
    return crypto
      .randomBytes(Math.ceil((length * 3) / 4))
      .toString('base64')
      .replace(/[^A-Za-z0-9@$!%*?&]/g, '')
      .slice(0, length);
  }
}
