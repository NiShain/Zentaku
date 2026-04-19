import type { Activity } from '../../../entities/Activity.entity';

export interface ActivityListResponseDto {
  data: Activity[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface RecentActivityResponseDto {
  data: Activity[];
}
