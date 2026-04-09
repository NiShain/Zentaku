import type { DataSource } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { BaseService } from '../../../core/base/BaseService';
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
import {
  AlreadyFollowedException,
  NotFollowedException,
  SelfFollowException,
  ValidationException,
} from '../exceptions/follow.exceptions';
import type { LibraryEntryRepository } from '../repositories/library-entry.repository';
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

  async followMedia(userId: string | bigint, mediaId: string | bigint): Promise<FollowResultDto> {
    const actorId = this.validateBigIntLike(userId, 'User ID');
    const targetMediaId = this.validateBigIntLike(mediaId, 'Media ID');

    const isFollowed = await this.libraryEntryRepository.isFollowed(actorId, targetMediaId);
    if (isFollowed) {
      throw new AlreadyFollowedException('Media is already followed');
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const media = await manager.getRepository(MediaItem).findOne({
        where: {
          id: this.toBigInt(targetMediaId),
        },
      });

      if (!media) {
        throw new ValidationException('Media not found');
      }

      const entry = await this.libraryEntryRepository.followMedia(actorId, targetMediaId, manager);

      const metadata: Omit<
        RichActivityMetadata,
        'targetId' | 'targetType' | 'action' | 'snapshotAt'
      > = {
        targetName: media.titleRomaji || media.titleEnglish || media.titleNative || undefined,
        targetImage: media.coverImage || undefined,
        mediaType: media.type,
      };

      await this.activityService.createFollowActivity(
        actorId,
        targetMediaId,
        ActivityTargetType.MEDIA,
        ActivityAction.FOLLOW,
        metadata,
        manager
      );

      return {
        success: true as const,
        action: ActivityAction.FOLLOW,
        targetType: ActivityTargetType.MEDIA,
        targetId: this.toStringId(targetMediaId),
        followedAt: entry.createdAt.toISOString(),
      };
    });

    return result;
  }

  async unfollowMedia(userId: string | bigint, mediaId: string | bigint): Promise<FollowResultDto> {
    const actorId = this.validateBigIntLike(userId, 'User ID');
    const targetMediaId = this.validateBigIntLike(mediaId, 'Media ID');

    const isFollowed = await this.libraryEntryRepository.isFollowed(actorId, targetMediaId);
    if (!isFollowed) {
      throw new NotFollowedException('Media is not followed');
    }

    await this.dataSource.transaction(async (manager) => {
      const media = await manager.getRepository(MediaItem).findOne({
        where: {
          id: this.toBigInt(targetMediaId),
        },
      });

      await this.libraryEntryRepository.unfollowMedia(actorId, targetMediaId, manager);

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
        targetMediaId,
        ActivityTargetType.MEDIA,
        ActivityAction.UNFOLLOW,
        metadata,
        manager
      );
    });

    return {
      success: true,
      action: ActivityAction.UNFOLLOW,
      targetType: ActivityTargetType.MEDIA,
      targetId: this.toStringId(targetMediaId),
      unfollowedAt: new Date().toISOString(),
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
      const entry = await this.libraryEntryRepository.getLibraryEntry(actorId, normalizedTargetId);
      const isFollowed = !!entry && entry.status !== LibraryStatus.DROPPED;

      return {
        targetType,
        targetId: this.toStringId(normalizedTargetId),
        isFollowed,
        followedAt: isFollowed && entry ? entry.createdAt.toISOString() : null,
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
}
