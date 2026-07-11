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

router.use(authMiddleware);

router.get('/', validate(employeeQuerySchema, 'query'), employeeController.getAll);

router.get('/:id', validate(employeeParamSchema, 'params'), employeeController.getById);

router.post('/', upload.single('photo'), validate(createEmployeeSchema), employeeController.create);

router.put(
  '/:id',
  upload.single('photo'),
  validate(updateEmployeeSchema),
  employeeController.update,
);

router.delete('/:id', validate(employeeParamSchema, 'params'), employeeController.delete);

export default router;
