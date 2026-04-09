import { Not, type Repository } from 'typeorm';
import { BaseRepository, type PaginatedResult } from '../../../core/base/BaseRepository';
import type { LibraryEntry } from '../../../entities/LibraryEntry.entity';
import { LibraryStatus } from '../../../entities/types/enums';

export class LibraryEntryRepository extends BaseRepository<LibraryEntry> {
  constructor(repository: Repository<LibraryEntry>) {
    super(repository);
  }

  async followMedia(userId: string | bigint, mediaId: string | bigint): Promise<LibraryEntry> {
    const normalizedUserId = this.toBigInt(userId);
    const normalizedMediaId = this.toBigInt(mediaId);

    const existing = await this.findOne({
      where: {
        userId: normalizedUserId,
        mediaId: normalizedMediaId,
      },
    });

    if (!existing) {
      return this.create({
        userId: normalizedUserId,
        mediaId: normalizedMediaId,
        status: LibraryStatus.PLANNING,
      });
    }

    if (existing.status === LibraryStatus.DROPPED) {
      const reactivated = await this.update(existing.id, {
        status: LibraryStatus.PLANNING,
      });

      if (reactivated) {
        return reactivated;
      }
    }

    return existing;
  }

  async unfollowMedia(userId: string | bigint, mediaId: string | bigint): Promise<void> {
    const normalizedUserId = this.toBigInt(userId);
    const normalizedMediaId = this.toBigInt(mediaId);

    const existing = await this.findOne({
      where: {
        userId: normalizedUserId,
        mediaId: normalizedMediaId,
      },
    });

    if (!existing) {
      return;
    }

    await this.update(existing.id, {
      status: LibraryStatus.DROPPED,
    });
  }

  async isFollowed(userId: string | bigint, mediaId: string | bigint): Promise<boolean> {
    const normalizedUserId = this.toBigInt(userId);
    const normalizedMediaId = this.toBigInt(mediaId);

    const entry = await this.findOne({
      where: {
        userId: normalizedUserId,
        mediaId: normalizedMediaId,
      },
      select: ['id', 'status'],
    });

    return !!entry && entry.status !== LibraryStatus.DROPPED;
  }

  async getFollowedMedias(
    userId: string | bigint,
    pagination: { page?: number; perPage?: number }
  ): Promise<PaginatedResult<LibraryEntry>> {
    const normalizedUserId = this.toBigInt(userId);
    const page = Math.max(1, pagination.page || 1);
    const perPage = Math.min(100, Math.max(1, pagination.perPage || 20));

    return this.paginate({
      where: {
        userId: normalizedUserId,
        status: Not(LibraryStatus.DROPPED),
      },
      page,
      perPage,
      relations: ['media'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  private toBigInt(value: string | bigint): bigint {
    if (typeof value === 'bigint') {
      return value;
    }

    return BigInt(value);
  }
}
