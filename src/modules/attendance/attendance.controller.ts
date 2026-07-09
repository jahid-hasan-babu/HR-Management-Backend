import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from './attendance.service';
import {
  ICreateAttendancePayload,
  IUpdateAttendancePayload,
  IAttendanceFilters,
  IAttendance,
} from '../../types/attendance.types';
import { IPaginatedResponse } from '../../types/common.types';
import { sendResponse } from '../../utils/response';
import httpStatus from 'http-status';

export class AttendanceController {
  private attendanceService: AttendanceService;

  constructor() {
    this.attendanceService = new AttendanceService();
  }

  /**
   * GET /attendance
   * List attendance entries with optional filters.
   */
  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: IAttendanceFilters = req.query as unknown as IAttendanceFilters;
      const result: IPaginatedResponse<IAttendance> = await this.attendanceService.getAll(filters);
      sendResponse(
        res,
        httpStatus.OK,
        'Attendance records retrieved successfully',
        result.data,
        result.meta,
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /attendance/:id
   * Get a single attendance entry.
   */
  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id: number = Number(req.params.id);
      const attendance: IAttendance = await this.attendanceService.getById(id);
      sendResponse<IAttendance>(
        res,
        httpStatus.OK,
        'Attendance record retrieved successfully',
        attendance,
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /attendance
   * Create or upsert an attendance entry.
   */
  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload: ICreateAttendancePayload = req.body as ICreateAttendancePayload;
      const attendance: IAttendance = await this.attendanceService.createOrUpsert(payload);
      sendResponse<IAttendance>(
        res,
        httpStatus.CREATED,
        'Attendance record created/updated successfully',
        attendance,
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /attendance/:id
   * Update an attendance entry.
   */
  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id: number = Number(req.params.id);
      const payload: IUpdateAttendancePayload = req.body as IUpdateAttendancePayload;
      const attendance: IAttendance = await this.attendanceService.update(id, payload);
      sendResponse<IAttendance>(
        res,
        httpStatus.OK,
        'Attendance record updated successfully',
        attendance,
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /attendance/:id
   * Delete an attendance entry.
   */
  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id: number = Number(req.params.id);
      await this.attendanceService.delete(id);
      sendResponse(res, httpStatus.OK, 'Attendance record deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
