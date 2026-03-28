import { BaseService } from '../../../core/base/BaseService';
import type { User } from '../../../entities/User.entity';
import { NotFoundError } from '../../../shared/utils/error';
import type { UpdatePreferencesDto, UpdatePrivacyDto, UpdateProfileDto } from '../dto/user.dto';
import type { UserRepository } from '../repositories/user.repository';
import type { IUserService } from '../types/user.types';

export class UserService extends BaseService implements IUserService {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async getProfile(userId: number): Promise<User> {
    const id = this._validateId(userId, 'User ID');

    const user = await this._executeWithErrorHandling(
      () => this.userRepository.findById(id),
      'getProfile'
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateProfile(userId: number, updateData: UpdateProfileDto): Promise<User> {
    const id = this._validateId(userId, 'User ID');
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const payload: Partial<User> = {};

    if (updateData.displayName !== undefined) {
      payload.displayName = this._validateString(updateData.displayName, 'Display name', {
        minLength: 1,
        maxLength: 255,
      });
    }

    if (updateData.bio !== undefined) {
      payload.bio = this._validateString(updateData.bio, 'Bio', {
        maxLength: 5000,
      });
    }

    if (updateData.location !== undefined) {
      payload.location = this._validateString(updateData.location, 'Location', {
        maxLength: 100,
      });
    }

    if (updateData.website !== undefined) {
      payload.website = this._validateString(updateData.website, 'Website', {
        maxLength: 255,
      });
    }

    if (updateData.gender !== undefined) {
      payload.gender = this._validateEnum(
        updateData.gender,
        ['male', 'female', 'other', 'prefer_not_to_say'] as const,
        'Gender'
      );
    }

    if (updateData.birthday !== undefined) {
      payload.birthday = updateData.birthday;
    }

    const updated = await this._executeWithErrorHandling(
      () => this.userRepository.update(id, payload),
      'updateProfile'
    );

    if (!updated) {
      throw new NotFoundError('User not found');
    }

    this._logInfo('User profile updated', { userId: id, fields: Object.keys(payload) });
    return updated;
  }

  async updatePreferences(userId: number, updateData: UpdatePreferencesDto): Promise<User> {
    const id = this._validateId(userId, 'User ID');
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const mergedPreferences = {
      ...(user.preferences || {}),
      ...(updateData.preferences || {}),
    };

    const mergedNotificationSettings = {
      ...(user.notificationSettings || {}),
      ...(updateData.notificationSettings || {}),
    };

    const updated = await this._executeWithErrorHandling(
      () =>
        this.userRepository.update(id, {
          preferences: mergedPreferences,
          notificationSettings: mergedNotificationSettings,
        }),
      'updatePreferences'
    );

    if (!updated) {
      throw new NotFoundError('User not found');
    }

    this._logInfo('User preferences updated', { userId: id });
    return updated;
  }

  async updatePrivacy(userId: number, updateData: UpdatePrivacyDto): Promise<User> {
    const id = this._validateId(userId, 'User ID');
    const visibility = this._validateEnum(
      updateData.profileVisibility,
      ['PUBLIC', 'FRIENDS_ONLY', 'PRIVATE'] as const,
      'Profile visibility'
    );

    const dbVisibilityMap: Record<
      'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE',
      'public' | 'friends' | 'private'
    > = {
      PUBLIC: 'public',
      FRIENDS_ONLY: 'friends',
      PRIVATE: 'private',
    };
    const dbVisibility = dbVisibilityMap[visibility];

    const updated = await this._executeWithErrorHandling(
      () =>
        this.userRepository.update(id, {
          profileVisibility: dbVisibility,
        }),
      'updatePrivacy'
    );

    if (!updated) {
      throw new NotFoundError('User not found');
    }

    this._logInfo('User privacy updated', { userId: id, visibility, dbVisibility });
    return updated;
  }

  async updateAvatar(userId: number, avatarPath: string): Promise<User> {
    const id = this._validateId(userId, 'User ID');
    const safePath = this._validateString(avatarPath, 'Avatar path', { maxLength: 500 });

    const updated = await this._executeWithErrorHandling(
      () => this.userRepository.update(id, { avatar: safePath }),
      'updateAvatar'
    );

    if (!updated) {
      throw new NotFoundError('User not found');
    }

    this._logInfo('User avatar updated', { userId: id, avatarPath: safePath });
    return updated;
  }

  async updateBanner(userId: number, bannerPath: string): Promise<User> {
    const id = this._validateId(userId, 'User ID');
    const safePath = this._validateString(bannerPath, 'Banner path', { maxLength: 500 });

    const updated = await this._executeWithErrorHandling(
      () => this.userRepository.update(id, { banner: safePath }),
      'updateBanner'
    );

    if (!updated) {
      throw new NotFoundError('User not found');
    }

    this._logInfo('User banner updated', { userId: id, bannerPath: safePath });
    return updated;
  }
}
