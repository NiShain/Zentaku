/**
 * Controller Types
 *
 * Type definitions specific to the presentation/controller layer.
 * These types handle HTTP-specific concerns and Express integration.
 */

import type {
  RequestHandler as ExpressRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express';
import type { ITokenPayload } from '../../modules/auth/types/auth.types';
import type { PaginatedResult } from './common';

/**
 * Extended Request with typed params, query, and body
 */
export interface TypedRequest<
  P = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  Q = Record<string, string>,
> extends Request<P, ResBody, ReqBody, Q> {
  user?: AuthenticatedUser;
}

/**
 * Authenticated user info attached to request
 */
export interface AuthenticatedUser extends ITokenPayload {
  permissions?: string[];
}

/**
 * API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

/**
 * API error structure
 */
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
  stack?: string;
}

/**
 * Response metadata
 */
export interface ResponseMeta {
  timestamp: string;
  requestId?: string;
  [key: string]: unknown;
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T> extends ApiResponse {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * HTTP status codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Request parameter types
 */
export interface RequestParams {
  id?: string;
  [key: string]: string | undefined;
}

/**
 * Request query types
 */
export interface RequestQuery {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | string[] | undefined;
}

/**
 * Pagination query params
 */
export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
}

/**
 * Search query params
 */
export interface SearchQuery extends PaginationQuery {
  q?: string;
  query?: string;
  search?: string;
}

/**
 * Sort query params
 */
export interface SortQuery {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter query params
 */
export interface FilterQuery {
  [key: string]: string | string[] | undefined;
}

/**
 * Combined query params
 */
export type FullQuery = Omit<PaginationQuery & SearchQuery & SortQuery, keyof FilterQuery> &
  FilterQuery;

/**
 * Request handler type (sync or async)
 */

export type RequestHandler<
  P = RequestParams,
  ResBody = unknown,
  ReqBody = unknown,
  Q = RequestQuery,
> = (
  _req: TypedRequest<P, ResBody, ReqBody, Q>,
  _res: Response<ApiResponse<ResBody>>,
  _next: NextFunction
) => void | Promise<void> | Response;

/**
 * Async request handler
 */

export type AsyncRequestHandler<
  P = RequestParams,
  ResBody = unknown,
  ReqBody = unknown,
  Q = RequestQuery,
> = (
  _req: TypedRequest<P, ResBody, ReqBody, Q>,
  _res: Response<ApiResponse<ResBody>>,
  _next: NextFunction
) => Promise<void | Response>;

/**
 * Error handler type
 */

export type ErrorHandler = (
  _err: Error,
  _req: Request,
  _res: Response,
  _next: NextFunction
) => void | Response;

/**
 * Middleware type
 */
export type Middleware = ExpressRequestHandler;

/**
 * Validation middleware options
 */
export interface ValidationOptions {
  body?: unknown;
  params?: unknown;
  query?: unknown;
  stripUnknown?: boolean;
}

/**
 * Route definition
 */
export interface RouteDefinition {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string;
  handler: RequestHandler;
  middlewares?: Middleware[];
  description?: string;
  tags?: string[];
}

/**
 * Controller route configuration
 */
export interface ControllerRouteConfig {
  basePath: string;
  routes: RouteDefinition[];
}

/**
 * Validation error response
 */
export interface ValidationErrorResponse {
  success: false;
  error: {
    message: string;
    code: 'VALIDATION_ERROR';
    details: Array<{
      field: string;
      message: string;
      value?: unknown;
    }>;
  };
}

/**
 * File upload info
 */
export type UploadedFile = Express.Multer.File;

/**
 * Request with file upload
 */
export interface RequestWithFile<
  P = RequestParams,
  ReqBody = unknown,
  Q = RequestQuery,
> extends TypedRequest<P, unknown, ReqBody, Q> {
  file?: UploadedFile;
  files?: UploadedFile[] | { [fieldname: string]: UploadedFile[] };
}

/**
 * Response helper methods
 */

export interface ResponseHelpers {
  success<T>(_data: T, _statusCode?: number): Response<ApiResponse<T>>;
  created<T>(_data: T): Response<ApiResponse<T>>;
  noContent(): Response;
  error(_message: string, _statusCode?: number, _details?: unknown): Response<ApiResponse>;
  badRequest(_message: string, _details?: unknown): Response<ApiResponse>;
  unauthorized(_message?: string): Response<ApiResponse>;
  forbidden(_message?: string): Response<ApiResponse>;
  notFound(_message?: string): Response<ApiResponse>;
  conflict(_message: string, _details?: unknown): Response<ApiResponse>;
  serverError(_message?: string, _error?: Error): Response<ApiResponse>;
  paginated<T>(_result: PaginatedResult<T>): Response<PaginatedApiResponse<T>>;
}

/**
 * Controller context (for dependency injection)
 */
export interface ControllerContext {
  req: Request;
  res: Response;
  next: NextFunction;
  user?: AuthenticatedUser;
}

/**
 * Request validator function
 */
export type RequestValidator<T = unknown> = (_data: unknown) => T | Promise<T>;

/**
 * Async handler wrapper result
 */
export type WrappedAsyncHandler = ExpressRequestHandler;

/**
 * Controller method decorator metadata
 */
export interface ControllerMethodMetadata {
  path: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  middlewares?: Middleware[];
  validators?: {
    body?: RequestValidator;
    params?: RequestValidator;
    query?: RequestValidator;
  };
}

/**
 * Extract params type from path
 * Example: '/users/:id/posts/:postId' -> { id: string; postId: string }
 */
export type PathParams<Path extends string> = Path extends `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param | keyof PathParams<`/${Rest}`>]: string }
  : Path extends `${string}:${infer Param}`
    ? { [K in Param]: string }
    : Record<string, never>;

/**
 * Type-safe route handler
 */
export type TypeSafeHandler<
  Path extends string,
  ReqBody = unknown,
  ResBody = unknown,
  Query = RequestQuery,
> = AsyncRequestHandler<PathParams<Path>, ResBody, ReqBody, Query>;

/**
 * Cookie options
 */
export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  domain?: string;
  path?: string;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Session data
 */
export interface SessionData {
  userId?: number;
  [key: string]: unknown;
}

/**
 * Request with session
 */
export interface RequestWithSession extends Request {
  session: SessionData;
}
