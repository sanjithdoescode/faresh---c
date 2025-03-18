export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public data?: any
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, data?: any) {
    super(400, message, 'VALIDATION_ERROR', data);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(403, message, 'AUTHORIZATION_ERROR');
  }
} 