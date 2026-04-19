import type { ActivityTargetType } from '../../activity/types/activity-types';
import type { MediaTrackingSnapshotDto } from './media-tracking.dto';

export interface FollowStatusDto {
  targetType: ActivityTargetType;
  targetId: string;
  isFollowed: boolean;
  followedAt: string | null;
  tracking?: MediaTrackingSnapshotDto | null;
}
