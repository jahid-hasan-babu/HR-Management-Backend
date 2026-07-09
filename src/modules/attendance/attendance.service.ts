import db from '../../config/database';
import { HttpException } from '../../errors/HttpException';
import {
  IAttendance,
  ICreateAttendancePayload,
  IUpdateAttendancePayload,
  IAttendanceFilters,
} from '../../types/attendance.types';
import { IPaginatedResponse } from '../../types/common.types';

export class AttendanceService {
  private readonly tableName: string = 'attendance';

  /**
   * Get all attendance entries with optional filters and pagination.
   * Supports filtering by employee_id and date range.
   */
  public async getAll(filters: IAttendanceFilters): Promise<IPaginatedResponse<IAttendance>> {
    const page: number = filters.page || 1;
    const limit: number = filters.limit || 10;
    const offset: number = (page - 1) * limit;

    let query = db(this.tableName);
    let countQuery = db(this.tableName);

    // Filter by employee_id
    if (filters.employee_id) {
      query = query.where('employee_id', filters.employee_id);
      countQuery = countQuery.where('employee_id', filters.employee_id);
    }

    // Filter by date range
    if (filters.from) {
      query = query.where('date', '>=', filters.from);
      countQuery = countQuery.where('date', '>=', filters.from);
    }

    if (filters.to) {
      query = query.where('date', '<=', filters.to);
      countQuery = countQuery.where('date', '<=', filters.to);
    }

    // Get total count
    const [{ count }] = await countQuery.count('id as count');
    const total: number = Number(count);

    // Get paginated data
    const data: IAttendance[] = await query
      .select('*')
      .orderBy('date', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single attendance entry by ID.
   */
  public async getById(id: number): Promise<IAttendance> {
    const attendance: IAttendance | undefined = await db(this.tableName).where({ id }).first();

    if (!attendance) {
      throw HttpException.notFound(`Attendance record with ID ${id} not found.`);
    }

    return attendance;
  }

  /**
   * Create or upsert an attendance entry.
   * If (employee_id, date) already exists, updates check_in_time instead.
   * Uses PostgreSQL ON CONFLICT for atomic upsert.
   */
  public async createOrUpsert(payload: ICreateAttendancePayload): Promise<IAttendance> {
    // Verify employee exists
    const employee = await db('employees')
      .where({ id: payload.employee_id })
      .whereNull('deleted_at')
      .first();

    if (!employee) {
      throw HttpException.notFound(`Employee with ID ${payload.employee_id} not found.`);
    }

    // Upsert using raw query for ON CONFLICT support
    const result: IAttendance[] = await db
      .raw(
        `INSERT INTO attendance (employee_id, date, check_in_time)
       VALUES (?, ?, ?)
       ON CONFLICT (employee_id, date)
       DO UPDATE SET check_in_time = EXCLUDED.check_in_time, updated_at = NOW()
       RETURNING *`,
        [payload.employee_id, payload.date, payload.check_in_time],
      )
      .then((res: { rows: IAttendance[] }) => res.rows);

    return result[0];
  }

  /**
   * Update an existing attendance entry by ID.
   */
  public async update(id: number, payload: IUpdateAttendancePayload): Promise<IAttendance> {
    // Verify attendance exists
    await this.getById(id);

    // If employee_id is being updated, verify the employee exists
    if (payload.employee_id) {
      const employee = await db('employees')
        .where({ id: payload.employee_id })
        .whereNull('deleted_at')
        .first();

      if (!employee) {
        throw HttpException.notFound(`Employee with ID ${payload.employee_id} not found.`);
      }
    }

    const [updatedAttendance]: IAttendance[] = await db(this.tableName)
      .where({ id })
      .update({ ...payload, updated_at: db.fn.now() })
      .returning('*');

    return updatedAttendance;
  }

  /**
   * Delete an attendance entry by ID.
   */
  public async delete(id: number): Promise<void> {
    // Verify attendance exists
    await this.getById(id);

    await db(this.tableName).where({ id }).del();
  }
}
