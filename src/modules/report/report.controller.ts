import { Request, Response, NextFunction } from 'express';
import { ReportService } from './report.service';
import { IMonthlyReportQuery, IMonthlyReportEntry } from '../../types/attendance.types';
import { sendResponse } from '../../utils/response';
import httpStatus from 'http-status';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  /**
   * GET /reports/attendance
   * Monthly attendance summary report.
   * Query: month=YYYY-MM (required), employee_id (optional)
   */
  public getMonthlyAttendance = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query: IMonthlyReportQuery = req.query as unknown as IMonthlyReportQuery;
      const report: IMonthlyReportEntry[] = await this.reportService.getMonthlyAttendance(query);
      sendResponse<IMonthlyReportEntry[]>(
        res,
        httpStatus.OK,
        'Monthly attendance report generated successfully',
        report,
      );
    } catch (error) {
      next(error);
    }
  };
}
