import { IPaginationQuery } from './common.types';

export interface IAttendance {
  id: number;
  employee_id: number;
  date: string;
  check_in_time: string;
  check_out_time: string | null;
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
  check_out_time?: string | null;
}

export interface IAttendanceFilters extends IPaginationQuery {
  employee_id?: number;
  from?: string;
  to?: string;
}

export interface IAttendanceReportQuery {
  month?: string;
  from?: string;
  to?: string;
  employee_id?: number;
  search?: string;
}

export interface IAttendanceReportEntry {
  employee_id: number;
  name: string;
  days_present: number;
  times_late: number;
}

export type IMonthlyReportQuery = IAttendanceReportQuery;
export type IMonthlyReportEntry = IAttendanceReportEntry;
