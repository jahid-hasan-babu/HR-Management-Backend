import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import hpp from 'hpp';
import path from 'path';
import fs from 'fs';
import envConfig from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';
import { IApiResponse } from './types/common.types';

// Import route modules
import authRoutes from './modules/auth/auth.routes';
import employeeRoutes from './modules/employee/employee.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import reportRoutes from './modules/report/report.routes';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeSecurityMiddlewares();
    this.initializeMiddlewares();
    this.initializeUploadDir();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize security middlewares to protect against common attacks.
   */
  private initializeSecurityMiddlewares(): void {
    // Helmet: sets various HTTP security headers
    // - Content-Security-Policy, X-Content-Type-Options, X-Frame-Options,
    // - X-XSS-Protection, Strict-Transport-Security, etc.
    this.app.use(helmet());

    // Global rate limiter: max 100 requests per 15 minutes per IP
    // Prevents brute-force attacks and DDoS
    const globalLimiter: RateLimitRequestHandler = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
      legacyHeaders: false, // Disable `X-RateLimit-*` headers
      message: {
        success: false,
        statusCode: 429,
        message: 'Too many requests, please try again after 15 minutes.',
      },
    });
    this.app.use(globalLimiter);

    // HPP: protect against HTTP Parameter Pollution attacks
    this.app.use(hpp());

    // CORS: restrict cross-origin requests
    this.app.use(cors());

    // Disable X-Powered-By header (already handled by helmet, but extra safety)
    this.app.disable('x-powered-by');
  }

  /**
   * Initialize general-purpose middlewares.
   */
  private initializeMiddlewares(): void {
    // Body parsers with size limits to prevent large payload attacks
    this.app.use(express.json({ limit: '10kb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    // HTTP request logger
    this.app.use(morgan('dev'));

    // Serve uploaded files as static assets
    this.app.use('/uploads', express.static(path.resolve(envConfig.UPLOAD_PATH)));
  }

  /**
   * Ensure the upload directory exists.
   */
  private initializeUploadDir(): void {
    const uploadDir: string = path.resolve(envConfig.UPLOAD_PATH);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  /**
   * Mount all route modules.
   */
  private initializeRoutes(): void {
    // Stricter rate limiter for auth routes (brute-force protection)
    // Max 10 login attempts per 15 minutes per IP
    const authLimiter: RateLimitRequestHandler = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // limit each IP to 10 login attempts per windowMs
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        statusCode: 429,
        message: 'Too many login attempts, please try again after 15 minutes.',
      },
    });

    // Health check
    this.app.get('/health', (_req: Request, res: Response): void => {
      const response: IApiResponse<{ status: string }> = {
        success: true,
        statusCode: 200,
        message: 'Server is running',
        data: { status: 'OK' },
      };
      res.status(200).json(response);
    });

    // API routes
    this.app.use('/auth', authLimiter, authRoutes);
    this.app.use('/employees', employeeRoutes);
    this.app.use('/attendance', attendanceRoutes);
    this.app.use('/reports', reportRoutes);

    // 404 handler for undefined routes
    this.app.use((_req: Request, res: Response): void => {
      const response: IApiResponse<null> = {
        success: false,
        statusCode: 404,
        message: 'Route not found',
      };
      res.status(404).json(response);
    });
  }

  /**
   * Initialize global error handling middleware.
   */
  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }
}

export default new App().app;
