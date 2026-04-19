import { Not, type EntityManager, type Repository } from 'typeorm';
import { BaseRepository, type PaginatedResult } from '../../../core/base/BaseRepository';
import type { LibraryEntry } from '../../../entities/LibraryEntry.entity';
import { LibraryStatus } from '../../../entities/types/enums';

export interface LibraryEntryTrackingUpdates {
  status?: LibraryStatus;
  progress?: number;
  progressVolumes?: number | null;
  score?: number | null;
  notes?: string | null;
  isPrivate?: boolean;
  rewatchCount?: number;
  startDate?: Date | null;
  finishDate?: Date | null;
}

export class LibraryEntryRepository extends BaseRepository<LibraryEntry> {
  constructor(repository: Repository<LibraryEntry>) {
    super(repository);
  }

  async upsertLibraryEntry(
    userId: string | bigint,
    mediaId: string | bigint,
    updates: LibraryEntryTrackingUpdates,
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
      const created = repo.create({
        userId: normalizedUserId,
        mediaId: normalizedMediaId,
        status: updates.status ?? LibraryStatus.PLANNING,
        progress: updates.progress ?? 0,
        progressVolumes: updates.progressVolumes ?? null,
        score: updates.score ?? null,
        notes: updates.notes ?? null,
        isPrivate: updates.isPrivate ?? false,
        rewatchCount: updates.rewatchCount ?? 0,
        startDate: updates.startDate ?? null,
        finishDate: updates.finishDate ?? null,
      });

      return repo.save(created);
    }

    if (updates.status !== undefined) {
      existing.status = updates.status;
    }
    if (updates.progress !== undefined) {
      existing.progress = updates.progress;
    }
    if (updates.progressVolumes !== undefined) {
      existing.progressVolumes = updates.progressVolumes;
    }
    if (updates.score !== undefined) {
      existing.score = updates.score;
    }
    if (updates.notes !== undefined) {
      existing.notes = updates.notes;
    }
    if (updates.isPrivate !== undefined) {
      existing.isPrivate = updates.isPrivate;
    }
    if (updates.rewatchCount !== undefined) {
      existing.rewatchCount = updates.rewatchCount;
    }
    if (updates.startDate !== undefined) {
      existing.startDate = updates.startDate;
    }
    if (updates.finishDate !== undefined) {
      existing.finishDate = updates.finishDate;
    }

    return repo.save(existing);
  }

  async followMedia(
    userId: string | bigint,
    mediaId: string | bigint,
    manager?: EntityManager
  ): Promise<LibraryEntry> {
    return this.upsertLibraryEntry(
      userId,
      mediaId,
      {
        status: LibraryStatus.PLANNING,
      },
      manager
    );
  }

  async unfollowMedia(
    userId: string | bigint,
    mediaId: string | bigint,
    manager?: EntityManager
  ): Promise<void> {
    await this.upsertLibraryEntry(
      userId,
      mediaId,
      {
        status: LibraryStatus.DROPPED,
      },
      manager
    );
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
