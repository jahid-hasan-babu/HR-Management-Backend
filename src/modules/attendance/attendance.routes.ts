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

router.get('/', validate(attendanceQuerySchema, 'query'), attendanceController.getAll);

router.get('/:id', validate(attendanceParamSchema, 'params'), attendanceController.getById);

router.post('/', validate(createAttendanceSchema), attendanceController.create);

router.put('/:id', validate(updateAttendanceSchema), attendanceController.update);

router.delete('/:id', validate(attendanceParamSchema, 'params'), attendanceController.delete);

export default router;
