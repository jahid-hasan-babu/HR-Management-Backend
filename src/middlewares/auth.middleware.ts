import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import envConfig from '../config/env';
import { IJwtPayload } from '../types/auth.types';
import { HttpException } from '../errors/HttpException';

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw HttpException.unauthorized('Access denied. No token provided.');
    }

    const token: string = authHeader.split(' ')[1];

    if (!token) {
      throw HttpException.unauthorized('Access denied. No token provided.');
    }

    const decoded: IJwtPayload = jwt.verify(token, envConfig.JWT_SECRET) as IJwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof HttpException) {
      next(error);
      return;
    }
    next(HttpException.unauthorized('Invalid or expired token.'));
  }
}
