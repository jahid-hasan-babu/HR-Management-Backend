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
  private readonly apiPrefix: string = '/api/v1';

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
    this.app.use(helmet());

    const globalLimiter: RateLimitRequestHandler = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        statusCode: 429,
        message: 'Too many requests, please try again after 15 minutes.',
      },
    });
    this.app.use(globalLimiter);
    this.app.use(hpp());
    this.app.use(cors());
    this.app.disable('x-powered-by');
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json({ limit: '10kb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    // HTTP request logger
    this.app.use(morgan('dev'));

    this.app.use('/uploads', express.static(path.resolve(envConfig.UPLOAD_PATH)));
  }

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
    const authLimiter: RateLimitRequestHandler = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        statusCode: 429,
        message: 'Too many login attempts, please try again after 15 minutes.',
      },
    });

    const runningResponse = (): IApiResponse<{ status: string }> => ({
      success: true,
      statusCode: 200,
      message: 'Server is running',
      data: { status: 'OK' },
    });

    // Root route and health check
    this.app.get('/', (_req: Request, res: Response): void => {
      res.status(200).json(runningResponse());
    });

    this.app.get('/health', (_req: Request, res: Response): void => {
      res.status(200).json(runningResponse());
    });

    this.app.get(`${this.apiPrefix}`, (_req: Request, res: Response): void => {
      res.status(200).json(runningResponse());
    });

    this.app.get(`${this.apiPrefix}/health`, (_req: Request, res: Response): void => {
      res.status(200).json(runningResponse());
    });

    // API routes
    this.app.use(`${this.apiPrefix}/auth`, authLimiter, authRoutes);
    this.app.use(`${this.apiPrefix}/employees`, employeeRoutes);
    this.app.use(`${this.apiPrefix}/attendance`, attendanceRoutes);
    this.app.use(`${this.apiPrefix}/reports`, reportRoutes);

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

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }
}

export default new App().app;
