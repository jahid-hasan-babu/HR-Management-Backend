import { Request, Response, NextFunction } from 'express';
import { ReportService } from './report.service';
import { IAttendanceReportQuery, IAttendanceReportEntry } from '../../types/attendance.types';
import { sendResponse } from '../../utils/response';
import httpStatus from 'http-status';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  public getAttendanceSummary = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query: IAttendanceReportQuery = req.query as unknown as IAttendanceReportQuery;
      const report: IAttendanceReportEntry[] = await this.reportService.getAttendanceSummary(query);
      sendResponse<IAttendanceReportEntry[]>(
        res,
        httpStatus.OK,
        'Attendance report generated successfully',
        report,
      );
    } catch (error) {
      next(error);
    }
  };
}
