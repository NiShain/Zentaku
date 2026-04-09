import type { EntityManager, Repository } from 'typeorm';
import { BaseRepository, type PaginatedResult } from '../../../core/base/BaseRepository';
import type { User } from '../../../entities/User.entity';
import type { UserRelationship } from '../../../entities/UserRelationship.entity';
import { RelationshipType } from '../../../entities/types/enums';

export class UserRelationshipRepository extends BaseRepository<UserRelationship> {
  constructor(repository: Repository<UserRelationship>) {
    super(repository);
  }

  async followUser(
    followerId: string | bigint,
    followingId: string | bigint,
    manager?: EntityManager
  ): Promise<UserRelationship> {
    const normalizedFollowerId = this.toBigInt(followerId);
    const normalizedFollowingId = this.toBigInt(followingId);
    const repo = this.getRepositoryForManager(manager);

    const existing = await repo.findOne({
      where: {
        followerId: normalizedFollowerId,
        followingId: normalizedFollowingId,
      },
    });

    if (existing) {
      if (existing.type !== RelationshipType.FOLLOW) {
        const updated = await repo.save({
          ...existing,
          type: RelationshipType.FOLLOW,
        });
        return updated;
      }

      return existing;
    }

    return repo.save(
      repo.create({
        followerId: normalizedFollowerId,
        followingId: normalizedFollowingId,
        type: RelationshipType.FOLLOW,
      })
    );
  }

  async unfollowUser(
    followerId: string | bigint,
    followingId: string | bigint,
    manager?: EntityManager
  ): Promise<void> {
    const normalizedFollowerId = this.toBigInt(followerId);
    const normalizedFollowingId = this.toBigInt(followingId);
    const repo = this.getRepositoryForManager(manager);

    // Schema hien tai cua user_relationships chua ho tro soft delete.
    // Fallback hard delete cho Phase 2; co the doi sang soft delete sau khi co migration.
    await repo.delete({
      followerId: normalizedFollowerId,
      followingId: normalizedFollowingId,
      type: RelationshipType.FOLLOW,
    });
  }

  async isFollowing(
    followerId: string | bigint,
    followingId: string | bigint,
    manager?: EntityManager
  ): Promise<boolean> {
    const normalizedFollowerId = this.toBigInt(followerId);
    const normalizedFollowingId = this.toBigInt(followingId);
    const repo = this.getRepositoryForManager(manager);

    const relationship = await repo.findOne({
      where: {
        followerId: normalizedFollowerId,
        followingId: normalizedFollowingId,
        type: RelationshipType.FOLLOW,
      },
      select: ['followerId', 'followingId', 'type'],
    });

    return Boolean(relationship);
  }

  async getFollowRelationship(
    followerId: string | bigint,
    followingId: string | bigint,
    manager?: EntityManager
  ): Promise<UserRelationship | null> {
    const normalizedFollowerId = this.toBigInt(followerId);
    const normalizedFollowingId = this.toBigInt(followingId);
    const repo = this.getRepositoryForManager(manager);

    return repo.findOne({
      where: {
        followerId: normalizedFollowerId,
        followingId: normalizedFollowingId,
        type: RelationshipType.FOLLOW,
      },
    });
  }

  async getFollowers(
    userId: string | bigint,
    pagination: { page?: number; perPage?: number }
  ): Promise<PaginatedResult<User>> {
    const normalizedUserId = this.toBigInt(userId);
    const page = Math.max(1, pagination.page || 1);
    const perPage = Math.min(100, Math.max(1, pagination.perPage || 20));
    const skip = (page - 1) * perPage;

    const [relationships, total] = await this.repository
      .createQueryBuilder('relationship')
      .leftJoinAndSelect('relationship.follower', 'follower')
      .where('relationship.following_id = :userId', {
        userId: normalizedUserId.toString(),
      })
      .andWhere('relationship.type = :type', {
        type: RelationshipType.FOLLOW,
      })
      .orderBy('relationship.created_at', 'DESC')
      .skip(skip)
      .take(perPage)
      .getManyAndCount();

    const data = relationships
      .map((relationship) => relationship.follower)
      .filter((follower): follower is User => Boolean(follower));

    const totalPages = Math.ceil(total / perPage);

    return {
      data,
      total,
      page,
      perPage,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  private toBigInt(value: string | bigint): bigint {
    if (typeof value === 'bigint') {
      return value;
    }

    return BigInt(value);
  }

  private getRepositoryForManager(manager?: EntityManager): Repository<UserRelationship> {
    return manager ? manager.getRepository(this.repository.target) : this.repository;
  }
}
