import type {
  ActivityAction,
  ActivityTargetType,
  RichActivityMetadata,
} from '../types/activity-types';

export interface CreateActivityDto {
  userId: string | bigint;
  type: string;
  targetId: string | bigint;
  targetType: ActivityTargetType;
  action: ActivityAction;
  metadata: RichActivityMetadata;
  mediaId?: string | bigint;
  listId?: string | bigint;
  communityId?: string | bigint;
}

export interface ActivityQueryPaginationDto {
  page?: number;
  perPage?: number;
  sort?: 'ASC' | 'DESC';
}

export interface ActivityTimeRangeDto extends ActivityQueryPaginationDto {
  startDate: Date;
  endDate: Date;
}
