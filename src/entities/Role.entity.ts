/**
 * Role Entity
 * Manages user roles for RBAC (Role-Based Access Control)
 */

import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { SoftDeletableEntity } from './base/SoftDeletableEntity';
import type { Permission } from './Permission.entity';
import type { User } from './User.entity';

@Entity('roles')
export class Role extends SoftDeletableEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string | null;

  // ==================== RELATIONSHIPS ====================

  @ManyToMany('User', 'roles')
  users!: User[];

  @ManyToMany('Permission', 'roles')
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions!: Permission[];
}
