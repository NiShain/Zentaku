/**
 * List Module Types
 *
 * Interface definitions for the List Feature
 */

import type { IBaseService } from '../../../core/base/BaseController';
import type { CustomList, ListItem } from '../../../entities';
import type {
  AddMemberDto,
  CreateListDto,
  InviteMemberDto,
  ListDetailDto,
  ListMemberDto,
  ListRequestDto,
  ListSummaryDto,
  RequestEditDto,
  RequestJoinDto,
  RespondToRequestDto,
  SearchListDto,
  UpdateListDto,
  UpdateMemberPermissionDto,
  UpdateThemeDto,
} from '../dto/list.dto';

export interface ListSearchResult {
  items: ListSummaryDto[];
  total: number;
}

export interface IListService extends IBaseService {
  // Phase 1: CRUD
  createList(userId: number, data: CreateListDto): Promise<CustomList>;
  updateList(listId: number, userId: number, data: UpdateListDto): Promise<CustomList>;
  deleteList(listId: number, userId: number): Promise<void>;
  getListDetail(listId: number, userId?: number): Promise<ListDetailDto>;
  getUserLists(username: string, userId?: number): Promise<ListSummaryDto[]>;
  getListAnimes(listId: number): Promise<ListItem[]>;

  // Phase 2: Member Management (stub for now)
  listMembers(listId: number): Promise<ListMemberDto[]>;
  addMember(listId: number, userId: number, data: AddMemberDto): Promise<void>;
  updateMemberPermission(
    listId: number,
    userId: number,
    data: UpdateMemberPermissionDto
  ): Promise<void>;
  removeMember(listId: number, userId: number, username: string): Promise<void>;

  // Phase 3: Invitations & Requests (stub for now)
  inviteMember(listId: number, userId: number, data: InviteMemberDto): Promise<void>;
  requestJoin(listId: number, userId: number, data: RequestJoinDto): Promise<void>;
  requestEdit(listId: number, userId: number, data: RequestEditDto): Promise<void>;
  getListRequests(listId: number, userId: number): Promise<ListRequestDto[]>;
  respondToRequest(
    listId: number,
    userId: number,
    requestId: number,
    data: RespondToRequestDto
  ): Promise<void>;

  // Phase 4: Theme & Likes (stub for now)
  updateTheme(listId: number, userId: number, data: UpdateThemeDto): Promise<CustomList>;
  toggleLike(listId: number, userId: number): Promise<void>;
  getLikeStatus(listId: number, userId: number): Promise<{ likedByMe: boolean }>;

  // Phase 5: Search (stub for now)
  searchLists(options: SearchListDto): Promise<ListSearchResult>;
}

export interface IListRepository {
  findListById(listId: number): Promise<CustomList | null>;
  createList(data: Partial<CustomList>): Promise<CustomList>;
  updateList(listId: number, data: Partial<CustomList>): Promise<CustomList>;
  deleteList(listId: number): Promise<void>;
  getUserLists(userId: number): Promise<CustomList[]>;
  getListBySlug(slug: string): Promise<CustomList | null>;
  getListsByUsername(username: string): Promise<CustomList[]>;
}
