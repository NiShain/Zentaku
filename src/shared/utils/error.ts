/**
 * Custom Error classes for handling application-specific errors.
 */
interface OperationalError extends Error {
  statusCode: number;
  isOperational: boolean;
}

/**
 * Custom error for Anilist API related issues.
 */
export class AnilistAPIError extends Error implements OperationalError {
  public readonly statusCode: number;
  public readonly isOperational: boolean = true;
  public readonly details: Record<string, unknown>;

  /**
   * @param message - Error message
   * @param statusCode - HTTP status code (default: 500)
   * @param details - Additional error details
   */
  constructor(message: string, statusCode: number = 500, details: Record<string, unknown> = {}) {
    super(message);
    this.name = 'AnilistAPIError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom error for not found resources.
 */
export class NotFoundError extends Error implements OperationalError {
  public readonly statusCode: number = 404;
  public readonly isOperational: boolean = true;

  constructor(message: string = 'Resource Not Found') {
    super(message);
    this.name = 'NotFoundError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom error for validation failures.
 */
export class ValidationError extends Error implements OperationalError {
  public readonly statusCode: number = 400;
  public readonly isOperational: boolean = true;
  public readonly errors: Record<string, unknown>;

  constructor(message: string = 'Validation Error', errors: Record<string, unknown> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends Error implements OperationalError {
  public readonly statusCode: number = 401;
  public readonly isOperational: boolean = true;

  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AniProviderUpstreamError extends Error implements OperationalError {
  public readonly statusCode: number;
  public readonly isOperational: boolean = true;
  public readonly code: string;
  public readonly requestId?: string;
  public readonly details: Record<string, unknown> | null;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    requestId?: string,
    details: Record<string, unknown> | null = null
  ) {
    super(message);
    this.name = 'AniProviderUpstreamError';
    this.statusCode = statusCode;
    this.code = code;
    this.requestId = requestId;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Type guard to check if error is operational
 */
export function isOperationalError(error: Error): error is OperationalError {
  return 'isOperational' in error && (error as OperationalError).isOperational === true;
}
