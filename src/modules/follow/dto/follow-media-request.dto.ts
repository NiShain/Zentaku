import type { MediaTrackingInputDto } from './media-tracking.dto';

export interface FollowMediaRequestDto {
  anilistId: string | bigint;
  tracking?: MediaTrackingInputDto;
}
