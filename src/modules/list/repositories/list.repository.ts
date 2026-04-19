/**
 * List Repository
 *
 * Data access layer for list operations
 */

import { BaseRepository } from '../../../core/base/BaseRepository';
import type { CustomList } from '../../../entities/CustomList.entity';
import type { Repository } from 'typeorm';
import type { IListRepository } from '../types/list.types';

export class ListRepository extends BaseRepository<CustomList> implements IListRepository {
  constructor(repository: Repository<CustomList>) {
    super(repository);
  }

  private _notImplemented(method: string, context?: Record<string, unknown>): never {
    throw new Error(`Not implemented yet (phase 0): ${method} ${JSON.stringify(context || {})}`);
  }

  // ==================== PHASE 1: CRUD ====================

  async findListById(listId: number): Promise<CustomList | null> {
    return this._notImplemented('findListById', { listId });
  }

  async createList(data: Partial<CustomList>): Promise<CustomList> {
    return this._notImplemented('createList', { fields: Object.keys(data || {}) });
  }

  async updateList(listId: number, data: Partial<CustomList>): Promise<CustomList> {
    return this._notImplemented('updateList', { listId, fields: Object.keys(data || {}) });
  }

  async deleteList(listId: number): Promise<void> {
    this._notImplemented('deleteList', { listId });
  }

  async getUserLists(userId: number): Promise<CustomList[]> {
    return this._notImplemented('getUserLists', { userId });
  }

  async getListBySlug(slug: string): Promise<CustomList | null> {
    return this._notImplemented('getListBySlug', { slug });
  }

  async getListsByUsername(username: string): Promise<CustomList[]> {
    return this._notImplemented('getListsByUsername', { username });
  }

  // ==================== HELPER: Slug generation ====================

  /**
   * Generate unique slug from list name
   * slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
   * If duplicate exists, append counter (try -1, -2, etc.)
   */
  async generateUniqueSlug(name: string): Promise<string> {
    return this._notImplemented('generateUniqueSlug', { name });
  }

  /**
   * Validate color is in whitelist palette
   */
  isValidColor(color: string): boolean {
    return this._notImplemented('isValidColor', { color });
  }
}
