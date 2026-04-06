import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {
  BaseController,
  type AuthenticatedRequest,
  type IBaseService,
} from '../../../core/base/BaseController';
import type { UpdatePreferencesDto, UpdatePrivacyDto, UpdateProfileDto } from '../dto/user.dto';
import type { IUserService } from '../types/user.types';

class UserController extends BaseController<IUserService & IBaseService> {
  constructor(userService: IUserService & IBaseService) {
    super(userService);
  }

  getProfile = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    this.requireAuth(authReq);

    const userId = this.getUserId(authReq);
    if (!userId) {
      this.error(res, 'Unauthorized', 401);
      return;
    }

    const user = await this.service.getProfile(userId);
    this.success(res, user);
  });

  updateProfile = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
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

    const updateData = this.getBody<UpdateProfileDto>(req);
    const updatedUser = await this.service.updateProfile(userId, updateData);
    this.success(res, updatedUser);
  });

  updatePreferences = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    this.requireAuth(authReq);

    const userId = this.getUserId(authReq);
    if (!userId) {
      this.error(res, 'Unauthorized', 401);
      return;
    }

    const updateData = this.getBody<UpdatePreferencesDto>(req);
    const updatedUser = await this.service.updatePreferences(userId, updateData);
    this.success(res, updatedUser);
  });

  updatePrivacy = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
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

    const updateData = this.getBody<UpdatePrivacyDto>(req);
    const updatedUser = await this.service.updatePrivacy(userId, updateData);
    this.success(res, updatedUser);
  });

  uploadAvatar = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    this.requireAuth(authReq);

    const userId = this.getUserId(authReq);
    if (!userId) {
      this.error(res, 'Unauthorized', 401);
      return;
    }

    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file) {
      this.error(res, 'Avatar file is required', 400);
      return;
    }

    const relativePath = `/uploads/users/avatar/${file.filename}`;
    const updatedUser = await this.service.updateAvatar(userId, relativePath);
    this.success(res, updatedUser);
  });

  uploadBanner = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    this.requireAuth(authReq);

    const userId = this.getUserId(authReq);
    if (!userId) {
      this.error(res, 'Unauthorized', 401);
      return;
    }

    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file) {
      this.error(res, 'Banner file is required', 400);
      return;
    }

    const relativePath = `/uploads/users/banner/${file.filename}`;
    const updatedUser = await this.service.updateBanner(userId, relativePath);
    this.success(res, updatedUser);
  });

  handleControllerError = (error: Error, req: Request, next: NextFunction): void => {
    this.handleError(error, req, next);
  };
}

export default UserController;
