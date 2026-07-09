import { IPaginationQuery } from './common.types';

export interface IAttendance {
  id: number;
  employee_id: number;
  date: string;
  check_in_time: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateAttendancePayload {
  employee_id: number;
  date: string;
  check_in_time: string;
}

export interface IUpdateAttendancePayload {
  employee_id?: number;
  date?: string;
  check_in_time?: string;
}

export interface IAttendanceFilters extends IPaginationQuery {
  employee_id?: number;
  from?: string;
  to?: string;
}

export interface IMonthlyReportQuery {
  month: string;
  employee_id?: number;
}

export interface IMonthlyReportEntry {
  employee_id: number;
  name: string;
  days_present: number;
  times_late: number;
}
