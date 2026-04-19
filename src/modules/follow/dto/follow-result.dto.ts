import type { ActivityAction, ActivityTargetType } from '../../activity/types/activity-types';
import type { MediaTrackingSnapshotDto } from './media-tracking.dto';

export interface FollowResultDto {
  success: true;
  action: ActivityAction;
  targetType: ActivityTargetType;
  targetId: string;
  followedAt?: string;
  unfollowedAt?: string;
  tracking?: MediaTrackingSnapshotDto | null;
}
