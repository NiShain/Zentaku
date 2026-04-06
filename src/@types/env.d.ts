/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PORT?: string;
    readonly DATABASE_URL: string;
    readonly JWT_SECRET: string;
    readonly JWT_EXPIRES_IN?: string;
    readonly JWT_REFRESH_SECRET: string;
    readonly JWT_REFRESH_EXPIRES_IN?: string;
    readonly BCRYPT_ROUNDS?: string;
    readonly EMAIL_HOST?: string;
    readonly EMAIL_PORT?: string;
    readonly EMAIL_SECURE?: string;
    readonly EMAIL_USER?: string;
    readonly EMAIL_PASSWORD?: string;
    readonly EMAIL_FROM?: string;
    readonly APP_URL?: string;
    readonly FRONTEND_URL?: string;
    readonly EMAIL_VERIFICATION_URL?: string;
    readonly PASSWORD_RESET_URL?: string;
    readonly CORS_ORIGIN?: string;
    readonly LOG_LEVEL?: 'error' | 'warn' | 'info' | 'debug';
    readonly ANILIST_API_URL?: string;
    readonly ANIPROVIDER_BASE_URL?: string;
    readonly ANIPROVIDER_API_KEY?: string;
    readonly ANIPROVIDER_AUTH_MODE?: 'X-API-Key' | 'Bearer';
    readonly ANIPROVIDER_TIMEOUT?: string;
    readonly CACHE_TTL?: string;
  }
}
