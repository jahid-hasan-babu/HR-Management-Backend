import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from './employee.service';
import {
  ICreateEmployeePayload,
  IUpdateEmployeePayload,
  IEmployeeFilters,
  IEmployee,
} from '../../types/employee.types';
import { IPaginatedResponse } from '../../types/common.types';
import { sendResponse } from '../../utils/response';
import httpStatus from 'http-status';

export class EmployeeController {
  private employeeService: EmployeeService;

  constructor() {
    this.employeeService = new EmployeeService();
  }
  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: IEmployeeFilters = req.query as unknown as IEmployeeFilters;
      const result: IPaginatedResponse<IEmployee> = await this.employeeService.getAll(filters);
      sendResponse(
        res,
        httpStatus.OK,
        'Employees retrieved successfully',
        result.data,
        result.meta,
      );
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id: number = Number(req.params.id);
      const employee: IEmployee = await this.employeeService.getById(id);
      sendResponse<IEmployee>(res, httpStatus.OK, 'Employee retrieved successfully', employee);
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload: ICreateEmployeePayload = req.body as ICreateEmployeePayload;

      if (req.file) {
        payload.photo_path = req.file.path;
      }

      const employee: IEmployee = await this.employeeService.create(payload);
      sendResponse<IEmployee>(res, httpStatus.CREATED, 'Employee created successfully', employee);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id: number = Number(req.params.id);
      const payload: IUpdateEmployeePayload = req.body as IUpdateEmployeePayload;

      if (req.file) {
        payload.photo_path = req.file.path;
      }

      const employee: IEmployee = await this.employeeService.update(id, payload);
      sendResponse<IEmployee>(res, httpStatus.OK, 'Employee updated successfully', employee);
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id: number = Number(req.params.id);
      await this.employeeService.delete(id);
      sendResponse(res, httpStatus.OK, 'Employee deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
