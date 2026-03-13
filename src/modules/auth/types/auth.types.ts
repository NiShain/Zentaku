export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ITokenPayload {
  userId: number;
  email: string;
  username: string;
  roles?: string[];
}

export interface IAuthUser {
  id: number;
  email: string;
  username: string;
  emailVerified: boolean;
  roles: string[];
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  GITHUB = 'github',
}
