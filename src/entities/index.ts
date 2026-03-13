/**
 * Entities Index
 *
 * Centralized export of all entity classes.
 * Import this file when registering entities with TypeORM.
 */

export * from './base';

export * from './types/enums';

// User
export { User } from './User.entity';
export { UserAuthentication } from './UserAuthentication.entity';
export { UserRelationship } from './UserRelationship.entity';

// Authentication & Authorization
export { Permission } from './Permission.entity';
export { RefreshToken } from './RefreshToken.entity';
export { Role } from './Role.entity';

// Media
export { AnimeItem } from './AnimeItem.entity';
export { MediaItem } from './MediaItem.entity';
export { NovelItem } from './NovelItem.entity';
export { ReadingMediaItem } from './ReadingMediaItem.entity';

// Library & Tracking
export { LibraryEntry } from './LibraryEntry.entity';
export { ProgressLog } from './ProgressLog.entity';

// Lists
export { CustomList } from './CustomList.entity';
export { ListInvitation } from './ListInvitation.entity';
export { ListItem } from './ListItem.entity';

// Community & Chat
export { Channel } from './Channel.entity';
export { ChannelParticipant } from './ChannelParticipant.entity';
export { Community } from './Community.entity';
export { CommunityMember } from './CommunityMember.entity';
export { Message } from './Message.entity';

// Integration Bridges
export { Activity } from './Activity.entity';
export { Comment } from './Comment.entity';
export { WatchRoomConfig } from './WatchRoomConfig.entity';
