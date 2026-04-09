import type { Request, Response } from 'express';
import {
  BaseController,
  type AuthenticatedRequest,
  type IBaseService,
} from '../../../core/base/BaseController';
import { ActivityTargetType } from '../../activity/types/activity-types';
import { ValidationException } from '../exceptions/follow.exceptions';
import type { FollowService } from '../services/follow.service';

class FollowController extends BaseController<FollowService & IBaseService> {
  constructor(followService: FollowService & IBaseService) {
    super(followService);
  }

  private getRequiredParam(req: Request, key: string): string {
    const value = req.params[key];
    if (!value) {
      throw new ValidationException(`${key} is required`);
    }
    return value;
  }

  private getAuthenticatedUserId(req: AuthenticatedRequest): string {
    this.requireAuth(req);

    const tokenUserId = this.getUserId(req);
    if (!tokenUserId) {
      throw new ValidationException('Unauthorized');
    }

    return String(tokenUserId);
  }

  followMedia = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = this.getAuthenticatedUserId(authReq);
    const anilistId = this.getRequiredParam(req, 'anilistId');

    const result = await this.service.followMedia(userId, anilistId);
    this.created(res, result);
  });

  unfollowMedia = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = this.getAuthenticatedUserId(authReq);
    const anilistId = this.getRequiredParam(req, 'anilistId');

    const result = await this.service.unfollowMedia(userId, anilistId);
    this.success(res, result);
  });

  getMediaFollowStatus = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = this.getAuthenticatedUserId(authReq);
    const anilistId = this.getRequiredParam(req, 'anilistId');

    const result = await this.service.getFollowStatus(userId, anilistId, ActivityTargetType.MEDIA);
    this.success(res, result);
  });

  followUser = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = this.getAuthenticatedUserId(authReq);
    const targetUserId = this.getRequiredParam(req, 'targetUserId');

    const result = await this.service.followUser(userId, targetUserId);
    this.created(res, result);
  });

  unfollowUser = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = this.getAuthenticatedUserId(authReq);
    const targetUserId = this.getRequiredParam(req, 'targetUserId');

    const result = await this.service.unfollowUser(userId, targetUserId);
    this.success(res, result);
  });

  getUserFollowStatus = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = this.getAuthenticatedUserId(authReq);
    const targetUserId = this.getRequiredParam(req, 'targetUserId');

    const result = await this.service.getFollowStatus(
      userId,
      targetUserId,
      ActivityTargetType.USER
    );
    this.success(res, result);
  });
}

export default FollowController;
