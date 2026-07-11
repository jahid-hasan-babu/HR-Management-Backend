import { IPaginationQuery } from './common.types';

export interface IEmployee {
  id: number;
  name: string;
  age: number;
  designation: string;
  hiring_date: string;
  date_of_birth: string;
  salary: number;
  photo_path: string | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateEmployeePayload {
  name: string;
  age: number;
  designation: string;
  hiring_date: string;
  date_of_birth: string;
  salary: number;
  photo_path?: string;
}

export interface IUpdateEmployeePayload {
  name?: string;
  age?: number;
  designation?: string;
  hiring_date?: string;
  date_of_birth?: string;
  salary?: number;
  photo_path?: string;
}

export interface IEmployeeFilters extends IPaginationQuery {
  id?: number;
  search?: string;
}
