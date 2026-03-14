import type { User } from '../../../entities/User.entity';
import type { UserAuthentication } from '../../../entities/UserAuthentication.entity';
import logger from '../../../shared/utils/logger';
import type { IUserRepository } from '../../user/repositories/user.repository';
import type { LoginDto, RegisterDto } from '../dto/auth.dto';
import type { IRefreshTokenRepository } from '../repositories/refresh-token.repository';
import type { IUserAuthenticationRepository } from '../repositories/user-authentication.repository';
import type { IAuthTokens, IAuthUser } from '../types/auth.types';
import { PasswordUtil } from '../utils/password.util';
import { TokenUtil } from '../utils/token.util';
import type { IEmailService } from './email.service';

export interface IAuthService {
  register(dto: RegisterDto): Promise<{ user: IAuthUser; message: string }>;
  login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IAuthTokens & { user: IAuthUser }>;
  verifyEmail(token: string): Promise<{ message: string }>;
  forgotPassword(email: string): Promise<{ message: string }>;
  resetPassword(token: string, newPassword: string): Promise<{ message: string }>;
  refreshToken(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<IAuthTokens>;
  logout(refreshToken: string): Promise<void>;
  getCurrentUser(userId: number): Promise<IAuthUser | null>;
}

export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userAuthRepository: IUserAuthenticationRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly emailService: IEmailService
  ) {}

  async register(dto: RegisterDto): Promise<{ user: IAuthUser; message: string }> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const existingUsername = await this.userRepository.findByUsername(dto.username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    const passwordHash = await PasswordUtil.hash(dto.password);
    const emailVerificationToken = TokenUtil.generateRandomToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await this.userRepository.create({
      username: dto.username,
      email: dto.email,
      displayName: dto.displayName ?? dto.username,
    });

    await this.userAuthRepository.create({
      userId: this.toNumberId(user.id),
      passwordHash,
      emailVerificationToken,
      emailVerificationExpires,
      emailVerified: false,
      isActive: true,
    });

    await this.emailService.sendVerificationEmail(
      user.email,
      user.displayName ?? user.username,
      emailVerificationToken
    );

    logger.info(`User registered: ${user.email}`);

    return {
      user: this.mapToAuthUser(user, false),
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  async login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IAuthTokens & { user: IAuthUser }> {
    const auth = await this.userAuthRepository.findWithUserByEmail(dto.email);
    if (!auth || !auth.user) {
      throw new Error('Invalid credentials');
    }

    const user = auth.user;

    if (auth.accountLocked && auth.lockedUntil && auth.lockedUntil > new Date()) {
      throw new Error('Account is locked due to multiple failed login attempts');
    }

    const isPasswordValid = await PasswordUtil.compare(dto.password, auth.passwordHash);
    if (!isPasswordValid) {
      await this.handleFailedLogin(auth);
      throw new Error('Invalid credentials');
    }

    if (!auth.emailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    if (!auth.isActive) {
      throw new Error('Account is inactive');
    }

    await this.userAuthRepository.update(auth.id, {
      failedLoginAttempts: 0,
      accountLocked: false,
      lockedUntil: null,
      lastLoginAt: new Date(),
    });

    const tokens = await this.generateTokens(user, ipAddress, userAgent);

    logger.info(`User logged in: ${user.email}`);

    return {
      ...tokens,
      user: this.mapToAuthUser(user, auth.emailVerified),
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const auth = await this.userAuthRepository.findByEmailVerificationToken(token);

    if (!auth) {
      throw new Error('Invalid or expired verification token');
    }

    if (auth.emailVerificationExpires && auth.emailVerificationExpires < new Date()) {
      throw new Error('Verification token has expired');
    }

    await this.userAuthRepository.update(auth.id, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });

    logger.info(`Email verified: ${auth.user.email}`);

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    const auth = await this.userAuthRepository.findByUserId(this.toNumberId(user.id));
    if (!auth) {
      return {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    const passwordResetToken = TokenUtil.generateRandomToken();
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await this.userAuthRepository.update(auth.id, {
      passwordResetToken,
      passwordResetExpires,
    });

    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.displayName ?? user.username,
      passwordResetToken
    );

    logger.info(`Password reset requested: ${user.email}`);

    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const auth = await this.userAuthRepository.findByPasswordResetToken(token);

    if (!auth) {
      throw new Error('Invalid or expired reset token');
    }

    if (auth.passwordResetExpires && auth.passwordResetExpires < new Date()) {
      throw new Error('Reset token has expired');
    }

    const passwordHash = await PasswordUtil.hash(newPassword);

    await this.userAuthRepository.update(auth.id, {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
      lastPasswordChange: new Date(),
    });

    await this.refreshTokenRepository.revokeAllUserTokens(auth.userId);

    logger.info(`Password reset: ${auth.user.email}`);

    return { message: 'Password reset successfully' };
  }

  async refreshToken(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IAuthTokens> {
    let payload: { userId: number };

    try {
      payload = TokenUtil.verifyRefreshToken(refreshToken);
    } catch {
      throw new Error('Invalid refresh token');
    }

    const tokenRecord = await this.refreshTokenRepository.findByToken(refreshToken);
    if (!tokenRecord || tokenRecord.isRevoked) {
      throw new Error('Invalid refresh token');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new Error('Refresh token expired');
    }

    const auth = await this.userAuthRepository.findWithUserById(payload.userId);
    if (!auth || !auth.user || !auth.isActive) {
      throw new Error('User not found or inactive');
    }

    await this.refreshTokenRepository.revokeToken(refreshToken);

    const tokens = await this.generateTokens(auth.user, ipAddress, userAgent);

    logger.info(`Token refreshed: ${auth.user.email}`);

    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.revokeToken(refreshToken);
    logger.info('User logged out');
  }

  async getCurrentUser(userId: number): Promise<IAuthUser | null> {
    const auth = await this.userAuthRepository.findWithUserById(userId);
    if (!auth || !auth.user) {
      return null;
    }

    return this.mapToAuthUser(auth.user, auth.emailVerified);
  }

  private async generateTokens(
    user: User,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IAuthTokens> {
    const payload = {
      userId: this.toNumberId(user.id),
      email: user.email,
      username: user.username,
      roles: user.roles?.map((role) => role.name) ?? [],
    };

    const accessToken = TokenUtil.generateAccessToken(payload);
    const refreshToken = TokenUtil.generateRefreshToken(payload);

    await this.refreshTokenRepository.create({
      token: refreshToken,
      userId: this.toNumberId(user.id),
      expiresAt: TokenUtil.getRefreshTokenExpiresAt(),
      ipAddress,
      userAgent,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: TokenUtil.getAccessTokenExpiresIn(),
    };
  }

  private async handleFailedLogin(auth: UserAuthentication): Promise<void> {
    const attempts = (auth.failedLoginAttempts ?? 0) + 1;
    const maxAttempts = 5;

    if (attempts >= maxAttempts) {
      await this.userAuthRepository.update(auth.id, {
        failedLoginAttempts: attempts,
        accountLocked: true,
        lockedUntil: new Date(Date.now() + 30 * 60 * 1000),
      });
      return;
    }

    await this.userAuthRepository.update(auth.id, {
      failedLoginAttempts: attempts,
    });
  }

  private mapToAuthUser(user: User, emailVerified: boolean): IAuthUser {
    return {
      id: this.toNumberId(user.id),
      email: user.email,
      username: user.username,
      emailVerified,
      roles: user.roles?.map((role) => role.name) ?? [],
    };
  }

  private toNumberId(id: number | bigint): number {
    return typeof id === 'bigint' ? Number(id) : id;
  }
}
