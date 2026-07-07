import { Request, Response, NextFunction } from 'express';
import { ApiError, ErrorCode, ErrorDetail } from '../types';

// Custom error class để carry structured error info qua middleware chain
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: ErrorDetail[];

  constructor(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: ErrorDetail[],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Factory helpers cho các loại lỗi phổ biến
export const notFound = (message = 'Resource not found') =>
  new AppError(404, 'NOT_FOUND', message);

export const badRequest = (message: string, details?: ErrorDetail[]) =>
  new AppError(400, 'BAD_REQUEST', message, details);

export const validationError = (details: ErrorDetail[]) =>
  new AppError(422, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', details);

export const unauthorized = (message = 'Unauthorized') =>
  new AppError(401, 'UNAUTHORIZED', message);

export const forbidden = (message = 'Forbidden') =>
  new AppError(403, 'FORBIDDEN', message);

/**
 * Centralized error handler middleware — tất cả lỗi đổ về đây
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const body: ApiError = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // Unexpected errors — log và trả 500
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  } satisfies ApiError);
}
