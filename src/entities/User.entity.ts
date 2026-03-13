/**
 * User Entity
 */

import { Column, Entity, JoinTable, ManyToMany, OneToMany, OneToOne } from 'typeorm';
import type { Activity } from './Activity.entity';
import { SoftDeletableEntity } from './base/SoftDeletableEntity';
import type { ChannelParticipant } from './ChannelParticipant.entity';
import type { Comment } from './Comment.entity';
import type { Community } from './Community.entity';
import type { CommunityMember } from './CommunityMember.entity';
import type { CustomList } from './CustomList.entity';
import type { LibraryEntry } from './LibraryEntry.entity';
import type { ListInvitation } from './ListInvitation.entity';
import type { ListItem } from './ListItem.entity';
import type { Message } from './Message.entity';
import type { ProgressLog } from './ProgressLog.entity';
import type { RefreshToken } from './RefreshToken.entity';
import type { Role } from './Role.entity';
import type { UserAuthentication } from './UserAuthentication.entity';
import type { UserRelationship } from './UserRelationship.entity';
import type { WatchRoomConfig } from './WatchRoomConfig.entity';

@Entity('users')
export class User extends SoftDeletableEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  username!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar?: string | null;

  @Column({ name: 'status_message', type: 'varchar', length: 500, nullable: true })
  statusMessage?: string | null;

  @Column({ type: 'json', nullable: true })
  settings?: Record<string, unknown> | null;

  // ==================== PERSONALIZATION FIELDS ====================

  @Column({ name: 'display_name', type: 'varchar', length: 255, nullable: true })
  displayName?: string | null;

  @Column({ type: 'text', nullable: true })
  bio?: string | null;

  @Column({ type: 'date', nullable: true })
  birthday?: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  banner?: string | null;

  @Column({
    type: 'enum',
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    nullable: true,
  })
  gender?: string | null;

  @Column({
    name: 'profile_visibility',
    type: 'enum',
    enum: ['public', 'friends', 'private'],
    default: 'public',
  })
  profileVisibility!: string;

  @Column({ name: 'notification_settings', type: 'json', nullable: true })
  notificationSettings?: {
    email: boolean;
    push: boolean;
    follows: boolean;
    comments: boolean;
    listUpdates: boolean;
  } | null;

  @Column({ type: 'json', nullable: true })
  preferences?: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    titleLanguage: 'romaji' | 'english' | 'native';
    adultContent: boolean;
  } | null;

  // ==================== RELATIONSHIPS ====================

  @OneToMany('LibraryEntry', 'user')
  libraryEntries!: LibraryEntry[];

  @OneToMany('ProgressLog', 'user')
  progressLogs!: ProgressLog[];

  @OneToMany('CustomList', 'owner')
  ownedLists!: CustomList[];

  @OneToMany('ListInvitation', 'inviter')
  listInvitesSent!: ListInvitation[];

  @OneToMany('ListInvitation', 'invitee')
  listInvitesReceived!: ListInvitation[];

  @OneToMany('ListItem', 'addedBy')
  addedListItems!: ListItem[];

  @OneToMany('UserRelationship', 'follower')
  following!: UserRelationship[];

  @OneToMany('UserRelationship', 'following')
  followers!: UserRelationship[];

  @OneToMany('Community', 'owner')
  ownedCommunities!: Community[];

  @OneToMany('CommunityMember', 'user')
  joinedCommunities!: CommunityMember[];

  @OneToMany('ChannelParticipant', 'user')
  channelParticipants!: ChannelParticipant[];

  @OneToMany('Message', 'sender')
  messages!: Message[];

  @OneToMany('WatchRoomConfig', 'host')
  hostedRooms!: WatchRoomConfig[];

  @OneToMany('Activity', 'user')
  activities!: Activity[];

  @OneToMany('Comment', 'user')
  comments!: Comment[];

  // Authentication (1-1 relationship)
  @OneToOne('UserAuthentication', 'user')
  authentication!: UserAuthentication;

  // Roles (many-to-many)
  @ManyToMany('Role', 'users')
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles!: Role[];

  // Refresh Tokens (1-many)
  @OneToMany('RefreshToken', 'user')
  refreshTokens!: RefreshToken[];
}
