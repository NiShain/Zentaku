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

  private assertSelfAction(req: AuthenticatedRequest, requestedUserId: string): void {
    this.requireAuth(req);

    const tokenUserId = this.getUserId(req);
    if (!tokenUserId) {
      throw new ValidationException('Unauthorized');
    }

    if (String(tokenUserId) !== requestedUserId) {
      const error = new Error(
        'Forbidden: cannot perform follow action for another user'
      ) as Error & {
        statusCode?: number;
      };
      error.statusCode = 403;
      throw error;
    }
  }

  followMedia = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = this.getRequiredParam(req, 'userId');
    const mediaId = this.getRequiredParam(req, 'mediaId');

    this.assertSelfAction(authReq, userId);

    const result = await this.service.followMedia(userId, mediaId);
    this.created(res, result);
  });

  unfollowMedia = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = this.getRequiredParam(req, 'userId');
    const mediaId = this.getRequiredParam(req, 'mediaId');

    this.assertSelfAction(authReq, userId);

    const result = await this.service.unfollowMedia(userId, mediaId);
    this.success(res, result);
  });

  getMediaFollowStatus = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.getRequiredParam(req, 'userId');
    const mediaId = this.getRequiredParam(req, 'mediaId');

    const result = await this.service.getFollowStatus(userId, mediaId, ActivityTargetType.MEDIA);
    this.success(res, result);
  });

  followUser = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = this.getRequiredParam(req, 'userId');
    const targetUserId = this.getRequiredParam(req, 'targetUserId');

    this.assertSelfAction(authReq, userId);

    const result = await this.service.followUser(userId, targetUserId);
    this.created(res, result);
  });

  unfollowUser = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = this.getRequiredParam(req, 'userId');
    const targetUserId = this.getRequiredParam(req, 'targetUserId');

    this.assertSelfAction(authReq, userId);

    const result = await this.service.unfollowUser(userId, targetUserId);
    this.success(res, result);
  });

  getUserFollowStatus = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.getRequiredParam(req, 'userId');
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
