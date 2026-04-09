import { Not, type EntityManager, type Repository } from 'typeorm';
import { BaseRepository, type PaginatedResult } from '../../../core/base/BaseRepository';
import type { LibraryEntry } from '../../../entities/LibraryEntry.entity';
import { LibraryStatus } from '../../../entities/types/enums';

export class LibraryEntryRepository extends BaseRepository<LibraryEntry> {
  constructor(repository: Repository<LibraryEntry>) {
    super(repository);
  }

  async followMedia(
    userId: string | bigint,
    mediaId: string | bigint,
    manager?: EntityManager
  ): Promise<LibraryEntry> {
    const normalizedUserId = this.toBigInt(userId);
    const normalizedMediaId = this.toBigInt(mediaId);
    const repo = this.getRepositoryForManager(manager);

    const existing = await repo.findOne({
      where: {
        userId: normalizedUserId,
        mediaId: normalizedMediaId,
      },
    });

    if (!existing) {
      return repo.save(
        repo.create({
          userId: normalizedUserId,
          mediaId: normalizedMediaId,
          status: LibraryStatus.PLANNING,
        })
      );
    }

    if (existing.status === LibraryStatus.DROPPED) {
      existing.status = LibraryStatus.PLANNING;
      return repo.save(existing);
    }

    return existing;
  }

  async unfollowMedia(
    userId: string | bigint,
    mediaId: string | bigint,
    manager?: EntityManager
  ): Promise<void> {
    const normalizedUserId = this.toBigInt(userId);
    const normalizedMediaId = this.toBigInt(mediaId);
    const repo = this.getRepositoryForManager(manager);

    const existing = await repo.findOne({
      where: {
        userId: normalizedUserId,
        mediaId: normalizedMediaId,
      },
    });

    if (!existing) {
      return;
    }

    existing.status = LibraryStatus.DROPPED;
    await repo.save(existing);
  }

  async isFollowed(
    userId: string | bigint,
    mediaId: string | bigint,
    manager?: EntityManager
  ): Promise<boolean> {
    const normalizedUserId = this.toBigInt(userId);
    const normalizedMediaId = this.toBigInt(mediaId);
    const repo = this.getRepositoryForManager(manager);

    const entry = await repo.findOne({
      where: {
        userId: normalizedUserId,
        mediaId: normalizedMediaId,
      },
      select: ['id', 'status'],
    });

    return !!entry && entry.status !== LibraryStatus.DROPPED;
  }

  async getLibraryEntry(
    userId: string | bigint,
    mediaId: string | bigint,
    manager?: EntityManager
  ): Promise<LibraryEntry | null> {
    const normalizedUserId = this.toBigInt(userId);
    const normalizedMediaId = this.toBigInt(mediaId);
    const repo = this.getRepositoryForManager(manager);

    return repo.findOne({
      where: {
        userId: normalizedUserId,
        mediaId: normalizedMediaId,
      },
    });
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

  private getRepositoryForManager(manager?: EntityManager): Repository<LibraryEntry> {
    return manager ? manager.getRepository(this.repository.target) : this.repository;
  }
}
