import type { ActivityAction, ActivityTargetType } from '../../activity/types/activity-types';

export interface FollowResultDto {
  success: true;
  action: ActivityAction;
  targetType: ActivityTargetType;
  targetId: string;
  followedAt?: string;
  unfollowedAt?: string;
}
