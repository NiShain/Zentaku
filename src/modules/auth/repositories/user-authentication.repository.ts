import type { Repository } from 'typeorm';
import { BaseRepository } from '../../../core/base/BaseRepository';
import type { UserAuthentication } from '../../../entities/UserAuthentication.entity';

export interface IUserAuthenticationRepository {
  findByUserId(userId: number): Promise<UserAuthentication | null>;
  findByEmailVerificationToken(token: string): Promise<UserAuthentication | null>;
  findByPasswordResetToken(token: string): Promise<UserAuthentication | null>;
  createForUser(userId: number, passwordHash: string): Promise<UserAuthentication>;
  create(data: Partial<UserAuthentication>): Promise<UserAuthentication>;
  update(
    id: number | bigint,
    data: Partial<UserAuthentication>
  ): Promise<UserAuthentication | null>;
  findWithUserByEmail(email: string): Promise<UserAuthentication | null>;
  findWithUserById(userId: number): Promise<UserAuthentication | null>;
  findByOAuthProvider(provider: string, providerId: string): Promise<UserAuthentication | null>;
}

export class UserAuthenticationRepository
  extends BaseRepository<UserAuthentication>
  implements IUserAuthenticationRepository
{
  constructor(repository: Repository<UserAuthentication>) {
    super(repository);
  }

  async findByUserId(userId: number): Promise<UserAuthentication | null> {
    return this.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  async findByEmailVerificationToken(token: string): Promise<UserAuthentication | null> {
    return this.findOne({
      where: { emailVerificationToken: token },
      relations: ['user'],
    });
  }

  async findByPasswordResetToken(token: string): Promise<UserAuthentication | null> {
    return this.findOne({
      where: { passwordResetToken: token },
      relations: ['user'],
    });
  }

  async createForUser(userId: number, passwordHash: string): Promise<UserAuthentication> {
    return this.create({
      userId,
      passwordHash,
      emailVerified: false,
      isActive: true,
    });
  }

  async findWithUserByEmail(email: string): Promise<UserAuthentication | null> {
    return this.repository
      .createQueryBuilder('auth')
      .leftJoinAndSelect('auth.user', 'user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findWithUserById(userId: number): Promise<UserAuthentication | null> {
    return this.repository
      .createQueryBuilder('auth')
      .leftJoinAndSelect('auth.user', 'user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions')
      .where('auth.userId = :userId', { userId })
      .getOne();
  }

  async findByOAuthProvider(
    provider: string,
    providerId: string
  ): Promise<UserAuthentication | null> {
    return this.repository
      .createQueryBuilder('auth')
      .leftJoinAndSelect('auth.user', 'user')
      .leftJoinAndSelect('user.roles', 'roles')
      .where('auth.oauthProvider = :provider', { provider })
      .andWhere('auth.oauthProviderId = :providerId', { providerId })
      .getOne();
  }
}
