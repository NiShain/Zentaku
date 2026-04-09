import type { EntityManager } from 'typeorm';
import { BaseService } from '../../../core/base/BaseService';
import type { Activity } from '../../../entities/Activity.entity';
import { ValidationError } from '../../../shared/utils/error';
import type { ActivityQueryPaginationDto, CreateActivityDto } from '../dto/create-activity.dto';
import type { HeatmapDayDto } from '../dto/heatmap-response.dto';
import type { ActivityRepository } from '../repositories/activity.repository';
import {
  ActivityTargetType,
  getFollowActivityType,
  type ActivityAction,
  type RichActivityMetadata,
} from '../types/activity-types';

export interface ActivityPaginatedResult {
  data: Activity[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class ActivityService extends BaseService {
  constructor(private readonly activityRepository: ActivityRepository) {
    super();
  }

  async createFollowActivity(
    userId: string | bigint,
    targetId: string | bigint,
    targetType: ActivityTargetType,
    action: ActivityAction,
    metadata: Omit<RichActivityMetadata, 'targetId' | 'targetType' | 'action' | 'snapshotAt'> = {},
    mediaId?: string | bigint,
    manager?: EntityManager
  ): Promise<Activity> {
    const validatedUserId = this.validateBigIntLike(userId, 'User ID');
    const validatedTargetId = this.validateBigIntLike(targetId, 'Target ID');

    const activityType = getFollowActivityType(targetType, action);

    const enrichedMetadata: RichActivityMetadata = {
      targetId: this.toStringId(validatedTargetId),
      targetType,
      action,
      snapshotAt: new Date().toISOString(),
      ...metadata,
    };

    const payload: CreateActivityDto = {
      userId: validatedUserId,
      targetId: validatedTargetId,
      targetType,
      action,
      type: activityType,
      metadata: enrichedMetadata,
      mediaId:
        mediaId !== undefined
          ? this.validateBigIntLike(mediaId, 'Media ID')
          : targetType === ActivityTargetType.MEDIA
            ? validatedTargetId
            : undefined,
    };

    return this.activityRepository.createActivity(payload, manager);
  }

  async getUserActivities(
    userId: string | bigint,
    pagination: ActivityQueryPaginationDto
  ): Promise<ActivityPaginatedResult> {
    const validatedUserId = this.validateBigIntLike(userId, 'User ID');
    const sanitizedPagination = this.normalizePagination(pagination);

    return this.activityRepository.getActivitiesByUser(validatedUserId, sanitizedPagination);
  }

  async getUserActivitiesByTimeRange(
    userId: string | bigint,
    startDate: Date,
    endDate: Date,
    pagination: ActivityQueryPaginationDto
  ): Promise<ActivityPaginatedResult> {
    const validatedUserId = this.validateBigIntLike(userId, 'User ID');

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new ValidationError('startDate and endDate must be valid ISO dates');
    }

    if (startDate > endDate) {
      throw new ValidationError('startDate must be less than or equal to endDate');
    }

    const sanitizedPagination = this.normalizePagination(pagination);

    return this.activityRepository.getActivitiesByTimeRange(
      validatedUserId,
      startDate,
      endDate,
      sanitizedPagination
    );
  }

  async getUserActivityHeatmap(userId: string | bigint, year: number): Promise<HeatmapDayDto[]> {
    const validatedUserId = this.validateBigIntLike(userId, 'User ID');

    if (!Number.isInteger(year) || year < 1970 || year > 3000) {
      throw new ValidationError('Year must be a valid integer between 1970 and 3000');
    }

    return this.activityRepository.getActivityHeatmap(validatedUserId, year);
  }

  async getRecentActivityFeed(limit: number = 20): Promise<Activity[]> {
    const safeLimit = Number.isInteger(limit) ? limit : 20;
    return this.activityRepository.getRecentActivities(safeLimit);
  }

  private normalizePagination(pagination: ActivityQueryPaginationDto): ActivityQueryPaginationDto {
    const page = Math.max(1, pagination.page || 1);
    const perPage = Math.min(100, Math.max(1, pagination.perPage || 20));

    let sort: 'ASC' | 'DESC' = 'DESC';
    if (pagination.sort && ['ASC', 'DESC'].includes(pagination.sort)) {
      sort = pagination.sort;
    }

    return {
      page,
      perPage,
      sort,
    };
  }

  private validateBigIntLike(value: string | bigint, fieldName: string): string | bigint {
    if (typeof value === 'bigint') {
      if (value <= 0n) {
        throw new ValidationError(`${fieldName} must be a positive integer`);
      }
      return value;
    }

    const normalized = String(value).trim();

    if (!/^\d+$/.test(normalized)) {
      throw new ValidationError(`${fieldName} must be an unsigned integer string`);
    }

    const parsed = BigInt(normalized);
    if (parsed <= 0n) {
      throw new ValidationError(`${fieldName} must be a positive integer`);
    }

    return normalized;
  }

  private toStringId(value: string | bigint): string {
    return typeof value === 'bigint' ? value.toString() : value;
  }
}
