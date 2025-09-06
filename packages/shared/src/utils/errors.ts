import { ErrorResponse } from '../types/common';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any,
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): ErrorResponse {
    return {
      statusCode: this.statusCode,
      message: this.message,
      ...(this.details && { details: this.details }),
      timestamp: new Date().toISOString(),
    };
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details?: any) {
    super(message, 400, true, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?: any) {
    super(message, 401, true, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: any) {
    super(message, 403, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found', details?: any) {
    super(message, 404, true, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', details?: any) {
    super(message, 409, true, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation Error', details?: any) {
    super(message, 422, true, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too Many Requests', details?: any) {
    super(message, 429, true, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', details?: any) {
    super(message, 500, false, details);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service Unavailable', details?: any) {
    super(message, 503, true, details);
  }
}

export const errorHandler = (error: any): ErrorResponse => {
  // Handle known error types
  if (error instanceof AppError) {
    return error.toJSON();
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return new UnauthorizedError('Invalid token').toJSON();
  }

  if (error.name === 'TokenExpiredError') {
    return new UnauthorizedError('Token expired').toJSON();
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    const details = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message,
    }));
    return new ValidationError('Validation failed', details).toJSON();
  }

  // Handle duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value.`;
    return new ConflictError(message).toJSON();
  }

  // Handle invalid ObjectId
  if (error.name === 'CastError') {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new BadRequestError(message).toJSON();
  }

  // Default to internal server error
  console.error('Unhandled error:', error);
  return new InternalServerError('Something went wrong').toJSON();
};
