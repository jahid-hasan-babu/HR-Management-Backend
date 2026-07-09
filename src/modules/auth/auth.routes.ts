import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { loginSchema } from '../../validators/auth.validator';

const router: Router = Router();
const authController: AuthController = new AuthController();

/**
 * POST /auth/login
 * Body: { email: string, password: string }
 * Returns: JWT token + user details
 */
router.post('/login', validate(loginSchema), authController.login);

export default router;
