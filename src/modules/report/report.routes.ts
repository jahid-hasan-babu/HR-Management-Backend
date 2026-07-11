import { Router } from 'express';
import { ReportController } from './report.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { reportQuerySchema } from '../../validators/attendance.validator';

const router: Router = Router();
const reportController: ReportController = new ReportController();

// All report routes require authentication
router.use(authMiddleware);

router.get(
  '/attendance',
  validate(reportQuerySchema, 'query'),
  reportController.getAttendanceSummary,
);

export default router;
