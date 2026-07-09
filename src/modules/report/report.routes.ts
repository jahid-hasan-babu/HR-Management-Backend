import { Router } from 'express';
import { ReportController } from './report.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { reportQuerySchema } from '../../validators/attendance.validator';

const router: Router = Router();
const reportController: ReportController = new ReportController();

// All report routes require authentication
router.use(authMiddleware);

/**
 * GET /reports/attendance
 * Query: ?month=2025-08&employee_id=12
 * Returns monthly attendance summary per employee.
 */
router.get(
  '/attendance',
  validate(reportQuerySchema, 'query'),
  reportController.getMonthlyAttendance,
);

export default router;
