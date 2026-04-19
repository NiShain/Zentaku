// Global type declarations for the application

import type Container from '../config/container';
import type { ITokenPayload } from '../modules/auth/types/auth.types';

declare module 'express' {
  interface Request {
    user?: ITokenPayload;
    container?: typeof Container;
    requestId?: string;
  }
}

export {};
