import db from '../../config/database';
import { IMonthlyReportEntry, IMonthlyReportQuery } from '../../types/attendance.types';
import { HttpException } from '../../errors/HttpException';

export class ReportService {
  /**
   * Generate a monthly attendance summary.
   * Returns per employee: employee_id, name, days_present, times_late.
   * Late rule: check_in_time > '09:45:00' counts as late.
   */
  public async getMonthlyAttendance(query: IMonthlyReportQuery): Promise<IMonthlyReportEntry[]> {
    const { month, employee_id } = query;

    // Parse month (YYYY-MM) to get start and end dates
    const [year, monthNum] = month.split('-').map(Number);

    if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
      throw HttpException.badRequest('Invalid month format. Use YYYY-MM.');
    }

    // Calculate first and last day of the month
    const startDate: string = `${month}-01`;
    const lastDay: number = new Date(year, monthNum, 0).getDate();
    const endDate: string = `${month}-${String(lastDay).padStart(2, '0')}`;

    let queryBuilder = db('attendance as a')
      .join('employees as e', 'a.employee_id', 'e.id')
      .whereNull('e.deleted_at')
      .where('a.date', '>=', startDate)
      .where('a.date', '<=', endDate)
      .select(
        'e.id as employee_id',
        'e.name',
        db.raw('COUNT(*)::integer as days_present'),
        db.raw("COUNT(CASE WHEN a.check_in_time > '09:45:00' THEN 1 END)::integer as times_late"),
      )
      .groupBy('e.id', 'e.name')
      .orderBy('e.name', 'asc');

    // Optional: filter by specific employee
    if (employee_id) {
      queryBuilder = queryBuilder.where('e.id', employee_id);
    }

    const report: IMonthlyReportEntry[] = await queryBuilder;

    return report;
  }
}
