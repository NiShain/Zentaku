export enum ActivityTargetType {
  MEDIA = 'MEDIA',
  USER = 'USER',
}

export enum ActivityAction {
  FOLLOW = 'FOLLOW',
  UNFOLLOW = 'UNFOLLOW',
}

export enum FollowActivityType {
  MEDIA_FOLLOW = 'MEDIA_FOLLOW',
  MEDIA_UNFOLLOW = 'MEDIA_UNFOLLOW',
  USER_FOLLOW = 'USER_FOLLOW',
  USER_UNFOLLOW = 'USER_UNFOLLOW',
}

export type ActivitySortOrder = 'ASC' | 'DESC';

export interface RichActivityMetadata {
  targetId: string;
  targetType: ActivityTargetType;
  action: ActivityAction;
  targetName?: string;
  targetImage?: string;
  mediaType?: string;
  snapshotAt: string;
  [key: string]: unknown;
}

export const FOLLOW_ACTIVITY_TYPES: Record<
  `${ActivityTargetType}_${ActivityAction}`,
  FollowActivityType
> = {
  MEDIA_FOLLOW: FollowActivityType.MEDIA_FOLLOW,
  MEDIA_UNFOLLOW: FollowActivityType.MEDIA_UNFOLLOW,
  USER_FOLLOW: FollowActivityType.USER_FOLLOW,
  USER_UNFOLLOW: FollowActivityType.USER_UNFOLLOW,
};

export function getFollowActivityType(
  targetType: ActivityTargetType,
  action: ActivityAction
): FollowActivityType {
  return FOLLOW_ACTIVITY_TYPES[`${targetType}_${action}`];
}
