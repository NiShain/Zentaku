import type { ActivityTargetType } from '../../activity/types/activity-types';

export interface FollowStatusDto {
  targetType: ActivityTargetType;
  targetId: string;
  isFollowed: boolean;
  followedAt: string | null;
}
