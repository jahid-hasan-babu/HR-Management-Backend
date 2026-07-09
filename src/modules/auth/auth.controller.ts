import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ILoginPayload, ILoginResponse } from '../../types/auth.types';
import { sendResponse } from '../../utils/response';
import httpStatus from 'http-status';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /auth/login
   * Authenticates an HR user and returns a JWT token.
   */
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload: ILoginPayload = req.body as ILoginPayload;
      const result: ILoginResponse = await this.authService.login(payload);
      sendResponse<ILoginResponse>(res, httpStatus.OK, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  };
}
