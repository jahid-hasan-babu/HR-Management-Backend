import { AppError } from './AppError';

export class HttpException extends AppError {
  constructor(message: string, statusCode: number) {
    super(message, statusCode, true);
  }

  static badRequest(message: string = 'Bad Request'): HttpException {
    return new HttpException(message, 400);
  }

  static unauthorized(message: string = 'Unauthorized'): HttpException {
    return new HttpException(message, 401);
  }

  static forbidden(message: string = 'Forbidden'): HttpException {
    return new HttpException(message, 403);
  }

  static notFound(message: string = 'Resource not found'): HttpException {
    return new HttpException(message, 404);
  }

  static conflict(message: string = 'Conflict'): HttpException {
    return new HttpException(message, 409);
  }

  static internal(message: string = 'Internal Server Error'): HttpException {
    return new HttpException(message, 500);
  }
}
