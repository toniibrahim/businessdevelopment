import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';
  const requestId = uuidv4();

  // Log error
  console.error(`[${requestId}] Error:`, {
    code,
    message,
    statusCode,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  // Send error response
  res.status(statusCode).json({
    error: {
      code,
      message,
      details: err.details || undefined,
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    request_id: requestId,
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

/**
 * Create custom API error
 */
export const createError = (
  message: string,
  statusCode: number = 500,
  code: string = 'ERROR',
  details?: any
): ApiError => {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
};

/**
 * Validation error creator
 */
export const validationError = (errors: any[]): ApiError => {
  return createError('Validation failed', 400, 'VALIDATION_ERROR', errors);
};

/**
 * Unauthorized error creator
 */
export const unauthorizedError = (message: string = 'Unauthorized'): ApiError => {
  return createError(message, 401, 'UNAUTHORIZED');
};

/**
 * Forbidden error creator
 */
export const forbiddenError = (message: string = 'Forbidden'): ApiError => {
  return createError(message, 403, 'FORBIDDEN');
};

/**
 * Not found error creator
 */
export const notFoundError = (resource: string = 'Resource'): ApiError => {
  return createError(`${resource} not found`, 404, 'NOT_FOUND');
};

/**
 * Conflict error creator
 */
export const conflictError = (message: string): ApiError => {
  return createError(message, 409, 'CONFLICT');
};
