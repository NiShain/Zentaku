import type { User } from '../../../entities/User.entity';
import type { UpdatePreferencesDto, UpdatePrivacyDto, UpdateProfileDto } from '../dto/user.dto';

export interface IUserService {
  getProfile(userId: number): Promise<User>;
  updateProfile(userId: number, updateData: UpdateProfileDto): Promise<User>;
  updatePreferences(userId: number, updateData: UpdatePreferencesDto): Promise<User>;
  updatePrivacy(userId: number, updateData: UpdatePrivacyDto): Promise<User>;
  updateAvatar(userId: number, avatarPath: string): Promise<User>;
  updateBanner(userId: number, bannerPath: string): Promise<User>;
}
