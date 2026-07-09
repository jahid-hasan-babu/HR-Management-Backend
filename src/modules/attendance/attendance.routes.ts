import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createAttendanceSchema,
  updateAttendanceSchema,
  attendanceQuerySchema,
  attendanceParamSchema,
} from '../../validators/attendance.validator';

const router: Router = Router();
const attendanceController: AttendanceController = new AttendanceController();

// All attendance routes require authentication
router.use(authMiddleware);

/**
 * GET /attendance
 * Query: ?employee_id=12&from=2025-08-01&to=2025-08-31&page=1&limit=10
 */
router.get('/', validate(attendanceQuerySchema, 'query'), attendanceController.getAll);

/**
 * GET /attendance/:id
 */
router.get('/:id', validate(attendanceParamSchema, 'params'), attendanceController.getById);

/**
 * POST /attendance
 * Body: { employee_id, date, check_in_time }
 * Upserts: if (employee_id, date) exists, updates check_in_time.
 */
router.post('/', validate(createAttendanceSchema), attendanceController.create);

/**
 * PUT /attendance/:id
 * Body: partial update fields
 */
router.put('/:id', validate(updateAttendanceSchema), attendanceController.update);

/**
 * DELETE /attendance/:id
 */
router.delete('/:id', validate(attendanceParamSchema, 'params'), attendanceController.delete);

export default router;
