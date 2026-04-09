import type { Repository } from 'typeorm';
import { BaseRepository, type PaginatedResult } from '../../../core/base/BaseRepository';
import type { Activity } from '../../../entities/Activity.entity';
import type { ActivityQueryPaginationDto, CreateActivityDto } from '../dto/create-activity.dto';
import type { HeatmapDayDto } from '../dto/heatmap-response.dto';

export class ActivityRepository extends BaseRepository<Activity> {
  constructor(repository: Repository<Activity>) {
    super(repository);
  }

  async createActivity(data: CreateActivityDto): Promise<Activity> {
    const payload: Partial<Activity> = {
      userId: this.toBigInt(data.userId),
      type: data.type,
      metaData: data.metadata,
    };

    if (data.mediaId !== undefined) {
      payload.mediaId = this.toBigInt(data.mediaId);
    }

    if (data.listId !== undefined) {
      payload.listId = this.toBigInt(data.listId);
    }

    if (data.communityId !== undefined) {
      payload.communityId = this.toBigInt(data.communityId);
    }

    return this.create(payload);
  }

  async getActivitiesByUser(
    userId: string | bigint,
    pagination: ActivityQueryPaginationDto
  ): Promise<PaginatedResult<Activity>> {
    const page = Math.max(1, pagination.page || 1);
    const perPage = Math.min(100, Math.max(1, pagination.perPage || 20));
    const sort = pagination.sort || 'DESC';

    return this.paginate({
      where: {
        userId: this.toBigInt(userId),
      },
      page,
      perPage,
      order: {
        createdAt: sort,
      },
      relations: ['media', 'list', 'community'],
    });
  }

  async getActivitiesByTimeRange(
    userId: string | bigint,
    startDate: Date,
    endDate: Date,
    pagination: ActivityQueryPaginationDto
  ): Promise<PaginatedResult<Activity>> {
    const page = Math.max(1, pagination.page || 1);
    const perPage = Math.min(100, Math.max(1, pagination.perPage || 20));
    const skip = (page - 1) * perPage;
    const sort = pagination.sort || 'DESC';

    const queryBuilder = this.repository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.media', 'media')
      .leftJoinAndSelect('activity.list', 'list')
      .leftJoinAndSelect('activity.community', 'community')
      .where('activity.user_id = :userId', { userId: this.toBigInt(userId).toString() })
      .andWhere('activity.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('activity.created_at', sort)
      .skip(skip)
      .take(perPage);

    const [data, total] = await queryBuilder.getManyAndCount();
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

  async getActivityHeatmap(userId: string | bigint, year: number): Promise<HeatmapDayDto[]> {
    const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0, 0));

    const rows = await this.repository
      .createQueryBuilder('activity')
      .select('DATE(activity.created_at)', 'date')
      .addSelect('COUNT(1)', 'count')
      .where('activity.user_id = :userId', { userId: this.toBigInt(userId).toString() })
      .andWhere('activity.created_at >= :startDate', { startDate })
      .andWhere('activity.created_at < :endDate', { endDate })
      .groupBy('DATE(activity.created_at)')
      .orderBy('DATE(activity.created_at)', 'ASC')
      .getRawMany<{ date: string; count: string }>();

    return rows.map((row) => ({
      date: row.date,
      count: Number(row.count),
    }));
  }

  async getRecentActivities(limit: number): Promise<Activity[]> {
    const safeLimit = Math.min(100, Math.max(1, limit));

    return this.findMany({
      order: {
        createdAt: 'DESC',
      },
      take: safeLimit,
      relations: ['media', 'list', 'community'],
    });
  }

  private toBigInt(value: string | bigint): bigint {
    if (typeof value === 'bigint') {
      return value;
    }

    return BigInt(value);
  }
}
