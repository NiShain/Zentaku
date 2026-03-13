export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface VerifyEmailDto {
  token: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface UpdateProfileDto {
  displayName?: string;
  bio?: string;
  birthday?: Date;
  location?: string;
  website?: string;
  gender?: string;
  profileVisibility?: string;
}
