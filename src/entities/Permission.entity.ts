/**
 * Permission Entity
 * Manages granular permissions for RBAC
 */

import { Column, Entity, ManyToMany } from 'typeorm';
import { SoftDeletableEntity } from './base/SoftDeletableEntity';
import type { Role } from './Role.entity';

@Entity('permissions')
export class Permission extends SoftDeletableEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string | null;

  // ==================== RELATIONSHIPS ====================

  @ManyToMany('Role', 'permissions')
  roles!: Role[];
}
