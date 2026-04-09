import type { DataSource, EntityManager } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { BaseService } from '../../../core/base/BaseService';
import type { LibraryEntry } from '../../../entities/LibraryEntry.entity';
import { MediaItem } from '../../../entities/MediaItem.entity';
import { LibraryStatus } from '../../../entities/types/enums';
import { User } from '../../../entities/User.entity';
import type { ActivityService } from '../../activity/services/activity.service';
import {
  ActivityAction,
  ActivityTargetType,
  type RichActivityMetadata,
} from '../../activity/types/activity-types';
import type { FollowResultDto } from '../dto/follow-result.dto';
import type { FollowStatusDto } from '../dto/follow-status.dto';
import type { MediaTrackingInputDto, MediaTrackingSnapshotDto } from '../dto/media-tracking.dto';
import {
  AlreadyFollowedException,
  NotFollowedException,
  SelfFollowException,
  ValidationException,
} from '../exceptions/follow.exceptions';
import type {
  LibraryEntryRepository,
  LibraryEntryTrackingUpdates,
} from '../repositories/library-entry.repository';
import type { UserRelationshipRepository } from '../repositories/user-relationship.repository';

export class FollowService extends BaseService {
  constructor(
    private readonly libraryEntryRepository: LibraryEntryRepository,
    private readonly userRelationshipRepository: UserRelationshipRepository,
    private readonly activityService: ActivityService,
    private readonly dataSource: DataSource = AppDataSource
  ) {
    super();
  }

  async followMedia(
    userId: string | bigint,
    anilistId: string | bigint,
    trackingInput?: MediaTrackingInputDto
  ): Promise<FollowResultDto> {
    const actorId = this.validateBigIntLike(userId, 'User ID');
    const normalizedAnilistId = this.validateBigIntLike(anilistId, 'AniList ID');
    const targetAnilistId = this.toStringId(normalizedAnilistId);
    const targetAnilistIdNumber = Number(targetAnilistId);
    const trackingUpdates = this.normalizeTrackingInput(trackingInput, {
      status: LibraryStatus.PLANNING,
    });

    const result = await this.dataSource.transaction(async (manager) => {
      const media = await this.resolveMediaByAnilistId(targetAnilistIdNumber, manager);
      const internalMediaId = media.id;

      const entry = await this.libraryEntryRepository.upsertLibraryEntry(
        actorId,
        internalMediaId,
        trackingUpdates,
        manager
      );
      const trackingSnapshot = this.toTrackingSnapshot(entry);

      const metadata: Omit<
        RichActivityMetadata,
        'targetId' | 'targetType' | 'action' | 'snapshotAt'
      > = {
        targetName: media.titleRomaji || media.titleEnglish || media.titleNative || undefined,
        targetImage: media.coverImage || undefined,
        mediaType: media.type,
        trackingStatus: trackingSnapshot.status,
        trackingProgress: trackingSnapshot.progress,
      };

      await this.activityService.createFollowActivity(
        actorId,
        targetAnilistId,
        ActivityTargetType.MEDIA,
        ActivityAction.FOLLOW,
        metadata,
        internalMediaId,
        manager
      );

      return {
        success: true as const,
        action: ActivityAction.FOLLOW,
        targetType: ActivityTargetType.MEDIA,
        targetId: this.toStringId(targetAnilistId),
        followedAt: entry.createdAt.toISOString(),
        tracking: trackingSnapshot,
      };
    });

    return result;
  }

  async updateMediaTracking(
    userId: string | bigint,
    anilistId: string | bigint,
    trackingInput: MediaTrackingInputDto
  ): Promise<FollowResultDto> {
    const actorId = this.validateBigIntLike(userId, 'User ID');
    const normalizedAnilistId = this.validateBigIntLike(anilistId, 'AniList ID');
    const targetAnilistId = this.toStringId(normalizedAnilistId);
    const targetAnilistIdNumber = Number(targetAnilistId);
    const trackingUpdates = this.normalizeTrackingInput(trackingInput, undefined, true);

    const result = await this.dataSource.transaction(async (manager) => {
      const media = await this.resolveMediaByAnilistId(targetAnilistIdNumber, manager);
      const internalMediaId = media.id;

      const entry = await this.libraryEntryRepository.upsertLibraryEntry(
        actorId,
        internalMediaId,
        trackingUpdates,
        manager
      );
      const trackingSnapshot = this.toTrackingSnapshot(entry);

      const metadata: Omit<
        RichActivityMetadata,
        'targetId' | 'targetType' | 'action' | 'snapshotAt'
      > = {
        targetName: media.titleRomaji || media.titleEnglish || media.titleNative || undefined,
        targetImage: media.coverImage || undefined,
        mediaType: media.type,
        trackingStatus: trackingSnapshot.status,
        trackingProgress: trackingSnapshot.progress,
      };

      await this.activityService.createFollowActivity(
        actorId,
        targetAnilistId,
        ActivityTargetType.MEDIA,
        ActivityAction.FOLLOW,
        metadata,
        internalMediaId,
        manager
      );

      return {
        success: true as const,
        action: ActivityAction.FOLLOW,
        targetType: ActivityTargetType.MEDIA,
        targetId: this.toStringId(targetAnilistId),
        followedAt: entry.createdAt.toISOString(),
        tracking: trackingSnapshot,
      };
    });

    return result;
  }

  async unfollowMedia(
    userId: string | bigint,
    anilistId: string | bigint
  ): Promise<FollowResultDto> {
    const actorId = this.validateBigIntLike(userId, 'User ID');
    const normalizedAnilistId = this.validateBigIntLike(anilistId, 'AniList ID');
    const targetAnilistId = this.toStringId(normalizedAnilistId);
    const targetAnilistIdNumber = Number(targetAnilistId);
    let updatedEntry: LibraryEntry | null = null;

    await this.dataSource.transaction(async (manager) => {
      const media = await this.resolveMediaByAnilistId(targetAnilistIdNumber, manager);
      const internalMediaId = media.id;

      const isFollowed = await this.libraryEntryRepository.isFollowed(
        actorId,
        internalMediaId,
        manager
      );
      if (!isFollowed) {
        throw new NotFollowedException('Media is not followed');
      }

      await this.libraryEntryRepository.unfollowMedia(actorId, internalMediaId, manager);
      updatedEntry = await this.libraryEntryRepository.getLibraryEntry(
        actorId,
        internalMediaId,
        manager
      );

      const metadata: Omit<
        RichActivityMetadata,
        'targetId' | 'targetType' | 'action' | 'snapshotAt'
      > = {
        targetName: media?.titleRomaji || media?.titleEnglish || media?.titleNative || undefined,
        targetImage: media?.coverImage || undefined,
        mediaType: media?.type,
      };

      await this.activityService.createFollowActivity(
        actorId,
        targetAnilistId,
        ActivityTargetType.MEDIA,
        ActivityAction.UNFOLLOW,
        metadata,
        internalMediaId,
        manager
      );
    });

    return {
      success: true,
      action: ActivityAction.UNFOLLOW,
      targetType: ActivityTargetType.MEDIA,
      targetId: this.toStringId(targetAnilistId),
      unfollowedAt: new Date().toISOString(),
      tracking: updatedEntry ? this.toTrackingSnapshot(updatedEntry) : null,
    };
  }

  async followUser(
    followerId: string | bigint,
    followingId: string | bigint
  ): Promise<FollowResultDto> {
    const actorId = this.validateBigIntLike(followerId, 'Follower ID');
    const targetUserId = this.validateBigIntLike(followingId, 'Following ID');

    if (this.toStringId(actorId) === this.toStringId(targetUserId)) {
      throw new SelfFollowException();
    }

    const isFollowing = await this.userRelationshipRepository.isFollowing(actorId, targetUserId);
    if (isFollowing) {
      throw new AlreadyFollowedException('User is already followed');
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const targetUser = await manager.getRepository(User).findOne({
        where: {
          id: this.toBigInt(targetUserId),
        },
      });

      if (!targetUser) {
        throw new ValidationException('Target user not found');
      }

      const relationship = await this.userRelationshipRepository.followUser(
        actorId,
        targetUserId,
        manager
      );

      const metadata: Omit<
        RichActivityMetadata,
        'targetId' | 'targetType' | 'action' | 'snapshotAt'
      > = {
        targetName: targetUser.displayName || targetUser.username,
        targetImage: targetUser.avatar || undefined,
      };

      await this.activityService.createFollowActivity(
        actorId,
        targetUserId,
        ActivityTargetType.USER,
        ActivityAction.FOLLOW,
        metadata,
        undefined,
        manager
      );

      return {
        success: true as const,
        action: ActivityAction.FOLLOW,
        targetType: ActivityTargetType.USER,
        targetId: this.toStringId(targetUserId),
        followedAt: relationship.createdAt.toISOString(),
      };
    });

    return result;
  }

  async unfollowUser(
    followerId: string | bigint,
    followingId: string | bigint
  ): Promise<FollowResultDto> {
    const actorId = this.validateBigIntLike(followerId, 'Follower ID');
    const targetUserId = this.validateBigIntLike(followingId, 'Following ID');

    if (this.toStringId(actorId) === this.toStringId(targetUserId)) {
      throw new SelfFollowException('Cannot unfollow yourself');
    }

    const isFollowing = await this.userRelationshipRepository.isFollowing(actorId, targetUserId);
    if (!isFollowing) {
      throw new NotFollowedException('User is not followed');
    }

    await this.dataSource.transaction(async (manager) => {
      const targetUser = await manager.getRepository(User).findOne({
        where: {
          id: this.toBigInt(targetUserId),
        },
      });

      await this.userRelationshipRepository.unfollowUser(actorId, targetUserId, manager);

      const metadata: Omit<
        RichActivityMetadata,
        'targetId' | 'targetType' | 'action' | 'snapshotAt'
      > = {
        targetName: targetUser?.displayName || targetUser?.username,
        targetImage: targetUser?.avatar || undefined,
      };

      await this.activityService.createFollowActivity(
        actorId,
        targetUserId,
        ActivityTargetType.USER,
        ActivityAction.UNFOLLOW,
        metadata,
        undefined,
        manager
      );
    });

    return {
      success: true,
      action: ActivityAction.UNFOLLOW,
      targetType: ActivityTargetType.USER,
      targetId: this.toStringId(targetUserId),
      unfollowedAt: new Date().toISOString(),
    };
  }

  async getFollowStatus(
    userId: string | bigint,
    targetId: string | bigint,
    targetType: ActivityTargetType
  ): Promise<FollowStatusDto> {
    const actorId = this.validateBigIntLike(userId, 'User ID');
    const normalizedTargetId = this.validateBigIntLike(targetId, 'Target ID');

    if (targetType === ActivityTargetType.MEDIA) {
      const media = await this.resolveMediaByAnilistId(Number(this.toStringId(normalizedTargetId)));
      const entry = await this.libraryEntryRepository.getLibraryEntry(actorId, media.id);
      const isFollowed = !!entry && entry.status !== LibraryStatus.DROPPED;

      return {
        targetType,
        targetId: this.toStringId(normalizedTargetId),
        isFollowed,
        followedAt: isFollowed && entry ? entry.createdAt.toISOString() : null,
        tracking: entry ? this.toTrackingSnapshot(entry) : null,
      };
    }

    if (targetType === ActivityTargetType.USER) {
      const relation = await this.userRelationshipRepository.getFollowRelationship(
        actorId,
        normalizedTargetId
      );

      return {
        targetType,
        targetId: this.toStringId(normalizedTargetId),
        isFollowed: Boolean(relation),
        followedAt: relation ? relation.createdAt.toISOString() : null,
      };
    }

    throw new ValidationException('Unsupported target type');
  }

  async getFollowStatuses(
    userId: string | bigint,
    targetIds: Array<string | bigint>,
    targetType: ActivityTargetType
  ): Promise<FollowStatusDto[]> {
    const actorId = this.validateBigIntLike(userId, 'User ID');

    return Promise.all(
      targetIds.map((targetId) => this.getFollowStatus(actorId, targetId, targetType))
    );
  }

  private validateBigIntLike(value: string | bigint, fieldName: string): string | bigint {
    if (typeof value === 'bigint') {
      if (value <= 0n) {
        throw new ValidationException(`${fieldName} must be a positive integer`);
      }
      return value;
    }

    const normalized = String(value).trim();
    if (!/^\d+$/.test(normalized)) {
      throw new ValidationException(`${fieldName} must be an unsigned integer string`);
    }

    const parsed = BigInt(normalized);
    if (parsed <= 0n) {
      throw new ValidationException(`${fieldName} must be a positive integer`);
    }

    return normalized;
  }

  private toBigInt(value: string | bigint): bigint {
    return typeof value === 'bigint' ? value : BigInt(value);
  }

  private toStringId(value: string | bigint): string {
    return typeof value === 'bigint' ? value.toString() : value;
  }

  private toTrackingSnapshot(
    entry: Pick<
      LibraryEntry,
      | 'status'
      | 'progress'
      | 'progressVolumes'
      | 'score'
      | 'notes'
      | 'isPrivate'
      | 'rewatchCount'
      | 'startDate'
      | 'finishDate'
    >
  ): MediaTrackingSnapshotDto {
    return {
      status: entry.status,
      progress: entry.progress,
      progressVolumes: entry.progressVolumes ?? null,
      score: entry.score ?? null,
      notes: entry.notes ?? null,
      isPrivate: entry.isPrivate,
      rewatchCount: entry.rewatchCount,
      startDate: this.normalizeStoredDate(entry.startDate),
      finishDate: this.normalizeStoredDate(entry.finishDate),
    };
  }

  private normalizeStoredDate(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (value instanceof Date) {
      return value.toISOString().split('T')[0] ?? null;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return null;
      }

      const directDate = trimmed.split('T')[0] ?? '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(directDate)) {
        return directDate;
      }

      const parsed = new Date(trimmed);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0] ?? null;
      }
    }

    return null;
  }

  private normalizeTrackingInput(
    input?: MediaTrackingInputDto,
    defaults?: LibraryEntryTrackingUpdates,
    requireAtLeastOneField = false
  ): LibraryEntryTrackingUpdates {
    const updates: LibraryEntryTrackingUpdates = {
      ...(defaults ?? {}),
    };

    if (!input) {
      if (requireAtLeastOneField) {
        throw new ValidationException('Tracking payload is required');
      }

      return updates;
    }

    const inputKeys = Object.keys(input);
    if (requireAtLeastOneField && inputKeys.length === 0) {
      throw new ValidationException('Tracking payload must include at least one field');
    }

    if (input.status !== undefined) {
      if (!Object.values(LibraryStatus).includes(input.status)) {
        throw new ValidationException('Invalid library status');
      }
      updates.status = input.status;
    }

    if (input.progress !== undefined) {
      if (!Number.isInteger(input.progress) || input.progress < 0) {
        throw new ValidationException('progress must be a non-negative integer');
      }
      updates.progress = input.progress;
    }

    if (input.progressVolumes !== undefined) {
      if (
        input.progressVolumes !== null &&
        (!Number.isInteger(input.progressVolumes) || input.progressVolumes < 0)
      ) {
        throw new ValidationException('progressVolumes must be null or a non-negative integer');
      }
      updates.progressVolumes = input.progressVolumes;
    }

    if (input.score !== undefined) {
      if (input.score !== null && (!Number.isFinite(input.score) || input.score < 0)) {
        throw new ValidationException('score must be null or a non-negative number');
      }
      updates.score = input.score;
    }

    if (input.notes !== undefined) {
      if (input.notes !== null && typeof input.notes !== 'string') {
        throw new ValidationException('notes must be null or a string');
      }
      updates.notes = input.notes;
    }

    if (input.isPrivate !== undefined) {
      if (typeof input.isPrivate !== 'boolean') {
        throw new ValidationException('isPrivate must be a boolean');
      }
      updates.isPrivate = input.isPrivate;
    }

    if (input.rewatchCount !== undefined) {
      if (!Number.isInteger(input.rewatchCount) || input.rewatchCount < 0) {
        throw new ValidationException('rewatchCount must be a non-negative integer');
      }
      updates.rewatchCount = input.rewatchCount;
    }

    if (input.startDate !== undefined) {
      updates.startDate = this.normalizeDateInput(input.startDate, 'startDate');
    }

    if (input.finishDate !== undefined) {
      updates.finishDate = this.normalizeDateInput(input.finishDate, 'finishDate');
    }

    return updates;
  }

  private normalizeDateInput(value: string | null, fieldName: string): Date | null {
    if (value === null) {
      return null;
    }

    if (typeof value !== 'string') {
      throw new ValidationException(`${fieldName} must be null or a date string`);
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new ValidationException(`${fieldName} must be a valid date string`);
    }

    return parsed;
  }

  private async resolveMediaByAnilistId(
    anilistId: number,
    manager?: EntityManager
  ): Promise<MediaItem> {
    const repository = manager
      ? manager.getRepository(MediaItem)
      : this.dataSource.getRepository(MediaItem);
    const media = await repository.findOne({
      where: {
        idAnilist: anilistId,
      },
    });

    if (!media) {
      throw new ValidationException('Media not found');
    }

    return media;
  }
}
