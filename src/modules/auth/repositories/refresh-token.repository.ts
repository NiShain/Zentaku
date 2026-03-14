import type { Repository } from 'typeorm';
import { BaseRepository } from '../../../core/base/BaseRepository';
import type { RefreshToken } from '../../../entities/RefreshToken.entity';

export interface IRefreshTokenRepository {
  findByToken(token: string): Promise<RefreshToken | null>;
  findByUserId(userId: number): Promise<RefreshToken[]>;
  revokeToken(token: string): Promise<void>;
  revokeAllUserTokens(userId: number): Promise<void>;
  deleteExpiredTokens(): Promise<void>;
}

export class RefreshTokenRepository
  extends BaseRepository<RefreshToken>
  implements IRefreshTokenRepository
{
  constructor(repository: Repository<RefreshToken>) {
    super(repository);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.findOne({
      where: { token, isRevoked: false },
      relations: ['user'],
    });
  }

  async findByUserId(userId: number): Promise<RefreshToken[]> {
    return this.findMany({
      where: { userId, isRevoked: false },
    });
  }

  async revokeToken(token: string): Promise<void> {
    await this.repository.update({ token }, { isRevoked: true });
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.repository.update({ userId }, { isRevoked: true });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
}
