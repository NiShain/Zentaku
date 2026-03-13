/**
 * RefreshToken Entity
 * Manages refresh tokens for JWT authentication
 */

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SoftDeletableEntity } from './base/SoftDeletableEntity';
import type { User } from './User.entity';

@Entity('refresh_tokens')
export class RefreshToken extends SoftDeletableEntity {
  @Column({ type: 'varchar', length: 500 })
  token!: string;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt!: Date;

  @Column({ name: 'is_revoked', type: 'boolean', default: false })
  isRevoked!: boolean;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent?: string | null;

  // ==================== RELATIONSHIPS ====================

  @ManyToOne('User', 'refreshTokens', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
