/**
 * List Controller
 *
 * HTTP request handler layer for list operations
 */

import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {
  BaseController,
  type AuthenticatedRequest,
  type IBaseService,
} from '../../../core/base/BaseController';
import type {
  AddMemberDto,
  CreateListDto,
  InviteMemberDto,
  RequestEditDto,
  RequestJoinDto,
  RespondToRequestDto,
  SearchListDto,
  UpdateListDto,
  UpdateMemberPermissionDto,
  UpdateThemeDto,
} from '../dto/list.dto';
import type { IListService } from '../types/list.types';

class ListController extends BaseController<IListService & IBaseService> {
  constructor(listService: IListService & IBaseService) {
    super(listService);
  }

  // ==================== PHASE 1: CRUD ====================

  /**
   * POST /list/create
   * Create a new custom list
   */
  createList = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      this.error(res, 'Validation failed', 400, errors.array());
      return;
    }

    const authReq = req as AuthenticatedRequest;
    this.requireAuth(authReq);

    const userId = this.getUserId(authReq);
    if (!userId) {
      this.error(res, 'Unauthorized', 401);
      return;
    }

    // TODO: Implement in Phase 1
    const createData = this.getBody<CreateListDto>(req);
    const newList = await this.service.createList(userId, createData);
    this.success(res, newList, 201);
  });

  /**
   * GET /list/user
   * Get all lists by username
   */
  getUserLists = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      this.error(res, 'Validation failed', 400, errors.array());
      return;
    }

    const authReq = req as AuthenticatedRequest;
    const userId = this.getUserId(authReq);

    const username = this.getStringQuery(req, 'username');

    // TODO: Implement in Phase 1
    const lists = await this.service.getUserLists(username, userId ?? undefined);
    this.success(res, lists);
  });

  /**
   * GET /list/:listId
   * Get list detail with anime items
   */
  getListDetail = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      this.error(res, 'Validation failed', 400, errors.array());
      return;
    }

    const authReq = req as AuthenticatedRequest;
    const userId = this.getUserId(authReq);

    const listId = this.getIntParam(req, 'listId');

    // TODO: Implement in Phase 1
    const listDetail = await this.service.getListDetail(listId, userId ?? undefined);
    this.success(res, listDetail);
  });

  /**
   * GET /list/anime/:listId
   * Get all anime items in a list
   */
  getListAnimes = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      this.error(res, 'Validation failed', 400, errors.array());
      return;
    }

    const listId = this.getIntParam(req, 'listId');

    // TODO: Implement in Phase 1
    const animes = await this.service.getListAnimes(listId);
    this.success(res, animes);
  });

  /**
   * PUT /list/:listId/update
   * Update list details
   */
  updateList = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      this.error(res, 'Validation failed', 400, errors.array());
      return;
    }

    const authReq = req as AuthenticatedRequest;
    this.requireAuth(authReq);

    const userId = this.getUserId(authReq);
    if (!userId) {
      this.error(res, 'Unauthorized', 401);
      return;
    }

    const listId = this.getIntParam(req, 'listId');
    const updateData = this.getBody<UpdateListDto>(req);

    // TODO: Implement in Phase 1
    const updatedList = await this.service.updateList(listId, userId, updateData);
    this.success(res, updatedList);
  });

  /**
   * DELETE /list/:listId/delete
   * Delete a list
   */
  deleteList = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      this.error(res, 'Validation failed', 400, errors.array());
      return;
    }

    const authReq = req as AuthenticatedRequest;
    this.requireAuth(authReq);

    const userId = this.getUserId(authReq);
    if (!userId) {
      this.error(res, 'Unauthorized', 401);
      return;
    }

    const listId = this.getIntParam(req, 'listId');

    // TODO: Implement in Phase 1
    await this.service.deleteList(listId, userId);
    this.success(res, { message: 'List deleted successfully' });
  });

  // ==================== PHASE 2: MEMBER MANAGEMENT (STUBS) ====================

  listMembers = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const listId = this.getIntParam(req, 'listId');
    const members = await this.service.listMembers(listId);
    this.success(res, members);
  });

  addMember = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    this.requireAuth(authReq);

    const userId = this.getUserId(authReq);
    if (!userId) {
      this.error(res, 'Unauthorized', 401);
      return;
    }

    const listId = this.getIntParam(req, 'listId');
    const payload = this.getBody<AddMemberDto>(req);
    await this.service.addMember(listId, userId, payload);
    this.success(res, { message: 'Member added' });
  });

  updateMemberPermission = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    this.requireAuth(authReq);

    const userId = this.getUserId(authReq);
    if (!userId) {
      this.error(res, 'Unauthorized', 401);
      return;
    }

    const listId = this.getIntParam(req, 'listId');
    const payload = this.getBody<UpdateMemberPermissionDto>(req);
    await this.service.updateMemberPermission(listId, userId, payload);
    this.success(res, { message: 'Member permission updated' });
  });

  removeMember = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    this.requireAuth(authReq);

    const userId = this.getUserId(authReq);
    if (!userId) {
      this.error(res, 'Unauthorized', 401);
      return;
    }

    const listId = this.getIntParam(req, 'listId');
    const username = this.getStringQuery(req, 'username');
    await this.service.removeMember(listId, userId, username);
    this.success(res, { message: 'Member removed' });
  });

  // ==================== PHASE 3: INVITES & REQUESTS (STUBS) ====================

  inviteMember = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    this.requireAuth(authReq);

    const userId = this.getUserId(authReq);
    if (!userId) {
      this.error(res, 'Unauthorized', 401);
      return;
    }

    const listId = this.getIntParam(req, 'listId');
    const payload = this.getBody<InviteMemberDto>(req);
    await this.service.inviteMember(listId, userId, payload);
    this.success(res, { message: 'Invitation sent' });
  });

  requestJoin = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    this.requireAuth(authReq);

    const userId = this.getUserId(authReq);
    if (!userId) {
      this.error(res, 'Unauthorized', 401);
      return;
    }

    const listId = this.getIntParam(req, 'listId');
    const payload = this.getBody<RequestJoinDto>(req);
    await this.service.requestJoin(listId, userId, payload);
    this.success(res, { message: 'Join request submitted' });
  });

  requestEdit = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    this.requireAuth(authReq);

    const userId = this.getUserId(authReq);
    if (!userId) {
      this.error(res, 'Unauthorized', 401);
      return;
    }

    const listId = this.getIntParam(req, 'listId');
    const payload = this.getBody<RequestEditDto>(req);
    await this.service.requestEdit(listId, userId, payload);
    this.success(res, { message: 'Edit request submitted' });
  });

  getListRequests = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    this.requireAuth(authReq);

    const userId = this.getUserId(authReq);
    if (!userId) {
      this.error(res, 'Unauthorized', 401);
      return;
    }

    const listId = this.getIntParam(req, 'listId');
    const requests = await this.service.getListRequests(listId, userId);
    this.success(res, requests);
  });

  respondToRequest = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    this.requireAuth(authReq);

    const userId = this.getUserId(authReq);
    if (!userId) {
      this.error(res, 'Unauthorized', 401);
      return;
    }

    const listId = this.getIntParam(req, 'listId');
    const requestId = this.getIntParam(req, 'requestId');
    const payload = this.getBody<RespondToRequestDto>(req);
    await this.service.respondToRequest(listId, userId, requestId, payload);
    this.success(res, { message: 'Request processed' });
  });

  // ==================== PHASE 4: THEME & LIKES (STUBS) ====================

  updateTheme = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    this.requireAuth(authReq);

    const userId = this.getUserId(authReq);
    if (!userId) {
      this.error(res, 'Unauthorized', 401);
      return;
    }

    const listId = this.getIntParam(req, 'listId');
    const payload = this.getBody<UpdateThemeDto>(req);
    const updated = await this.service.updateTheme(listId, userId, payload);
    this.success(res, updated);
  });

  toggleLike = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    this.requireAuth(authReq);

    const userId = this.getUserId(authReq);
    if (!userId) {
      this.error(res, 'Unauthorized', 401);
      return;
    }

    const listId = this.getIntParam(req, 'listId');
    await this.service.toggleLike(listId, userId);
    this.success(res, { message: 'Like status toggled' });
  });

  getLikeStatus = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    this.requireAuth(authReq);

    const userId = this.getUserId(authReq);
    if (!userId) {
      this.error(res, 'Unauthorized', 401);
      return;
    }

    const listId = this.getIntParam(req, 'listId');
    const likeStatus = await this.service.getLikeStatus(listId, userId);
    this.success(res, likeStatus);
  });

  // ==================== PHASE 5: SEARCH (STUBS) ====================

  searchLists = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const payload = this.getBody<SearchListDto>(req);
    const result = await this.service.searchLists(payload);
    this.success(res, result);
  });
}

export = ListController;
