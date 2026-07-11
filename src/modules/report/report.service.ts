import db from '../../config/database';
import { IAttendanceReportEntry, IAttendanceReportQuery } from '../../types/attendance.types';

export class ReportService {
  public async getAttendanceSummary(
    query: IAttendanceReportQuery,
  ): Promise<IAttendanceReportEntry[]> {
    const { month, from, to, employee_id, search } = query;

    let startDate: string;
    let endDate: string;

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);

      if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
        throw new Error('Invalid month format. Use YYYY-MM.');
      }

      startDate = `${month}-01`;
      const lastDay: number = new Date(year, monthNum, 0).getDate();
      endDate = `${month}-${String(lastDay).padStart(2, '0')}`;
    } else {
      startDate = from as string;
      endDate = to as string;
    }

    let queryBuilder = db('attendance as a')
      .join('employees as e', 'a.employee_id', 'e.id')
      .whereNull('e.deleted_at')
      .whereBetween('a.date', [startDate, endDate])
      .select(
        'e.id as employee_id',
        'e.name',
        db.raw('COUNT(*)::integer as days_present'),
        db.raw("COUNT(CASE WHEN a.check_in_time > '09:45:00' THEN 1 END)::integer as times_late"),
      )
      .groupBy('e.id', 'e.name')
      .orderBy('e.name', 'asc');

    if (employee_id) {
      queryBuilder = queryBuilder.where('e.id', employee_id);
    }

    const searchTerm: string | undefined = search?.trim();

    if (searchTerm) {
      queryBuilder = queryBuilder.where('e.name', 'ILIKE', `%${searchTerm}%`);
    }

    const report: IAttendanceReportEntry[] = await queryBuilder;

    return report;
  }
}
