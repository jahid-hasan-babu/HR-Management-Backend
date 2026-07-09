import { Router } from 'express';
import { EmployeeController } from './employee.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeQuerySchema,
  employeeParamSchema,
} from '../../validators/employee.validator';
import upload from '../../config/multer';

const router: Router = Router();
const employeeController: EmployeeController = new EmployeeController();

// All employee routes require authentication
router.use(authMiddleware);

/**
 * GET /employees
 * Query: ?search=rahim&page=1&limit=10
 */
router.get('/', validate(employeeQuerySchema, 'query'), employeeController.getAll);

/**
 * GET /employees/:id
 */
router.get('/:id', validate(employeeParamSchema, 'params'), employeeController.getById);

/**
 * POST /employees
 * Body: multipart/form-data with optional photo field
 */
router.post('/', upload.single('photo'), validate(createEmployeeSchema), employeeController.create);

/**
 * PUT /employees/:id
 * Body: multipart/form-data with optional photo field
 */
router.put(
  '/:id',
  upload.single('photo'),
  validate(updateEmployeeSchema),
  employeeController.update,
);

/**
 * DELETE /employees/:id
 */
router.delete('/:id', validate(employeeParamSchema, 'params'), employeeController.delete);

export default router;
