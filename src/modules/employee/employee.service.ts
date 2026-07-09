import db from '../../config/database';
import { HttpException } from '../../errors/HttpException';
import {
  IEmployee,
  ICreateEmployeePayload,
  IUpdateEmployeePayload,
  IEmployeeFilters,
} from '../../types/employee.types';
import { IPaginatedResponse } from '../../types/common.types';

export class EmployeeService {
  private readonly tableName: string = 'employees';

  /**
   * Get all employees with optional pagination and search.
   * Excludes soft-deleted employees.
   */
  public async getAll(filters: IEmployeeFilters): Promise<IPaginatedResponse<IEmployee>> {
    const page: number = filters.page || 1;
    const limit: number = filters.limit || 10;
    const offset: number = (page - 1) * limit;

    let query = db(this.tableName).whereNull('deleted_at');
    let countQuery = db(this.tableName).whereNull('deleted_at');

    // Search by name (ILIKE for case-insensitive partial match)
    if (filters.search) {
      query = query.where('name', 'ILIKE', `%${filters.search}%`);
      countQuery = countQuery.where('name', 'ILIKE', `%${filters.search}%`);
    }

    // Get total count
    const [{ count }] = await countQuery.count('id as count');
    const total: number = Number(count);

    // Get paginated data
    const data: IEmployee[] = await query
      .select('*')
      .orderBy('created_at', 'desc')
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
   * Get a single employee by ID.
   * Throws 404 if not found or soft-deleted.
   */
  public async getById(id: number): Promise<IEmployee> {
    const employee: IEmployee | undefined = await db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .first();

    if (!employee) {
      throw HttpException.notFound(`Employee with ID ${id} not found.`);
    }

    return employee;
  }

  /**
   * Create a new employee.
   */
  public async create(payload: ICreateEmployeePayload): Promise<IEmployee> {
    const [employee]: IEmployee[] = await db(this.tableName).insert(payload).returning('*');
    return employee;
  }

  /**
   * Update an existing employee by ID.
   * Supports partial updates including photo replacement.
   */
  public async update(id: number, payload: IUpdateEmployeePayload): Promise<IEmployee> {
    // Verify employee exists
    await this.getById(id);

    const [updatedEmployee]: IEmployee[] = await db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({ ...payload, updated_at: db.fn.now() })
      .returning('*');

    return updatedEmployee;
  }

  /**
   * Soft delete an employee by setting deleted_at timestamp.
   */
  public async delete(id: number): Promise<void> {
    // Verify employee exists
    await this.getById(id);

    await db(this.tableName)
      .where({ id })
      .update({ deleted_at: db.fn.now(), updated_at: db.fn.now() });
  }
}
