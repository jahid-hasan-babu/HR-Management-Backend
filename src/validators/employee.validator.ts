import Joi from 'joi';

export const createEmployeeSchema: Joi.ObjectSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 100 characters',
    'any.required': 'Name is required',
  }),
  age: Joi.number().integer().min(18).max(100).required().messages({
    'number.min': 'Age must be at least 18',
    'number.max': 'Age must not exceed 100',
    'any.required': 'Age is required',
  }),
  designation: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Designation must be at least 2 characters',
    'any.required': 'Designation is required',
  }),
  hiring_date: Joi.date().iso().required().messages({
    'date.format': 'Hiring date must be in ISO date format (YYYY-MM-DD)',
    'any.required': 'Hiring date is required',
  }),
  date_of_birth: Joi.date().iso().required().messages({
    'date.format': 'Date of birth must be in ISO date format (YYYY-MM-DD)',
    'any.required': 'Date of birth is required',
  }),
  salary: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Salary must be a positive number',
    'any.required': 'Salary is required',
  }),
});

export const updateEmployeeSchema: Joi.ObjectSchema = Joi.object({
  name: Joi.string().min(2).max(100).messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 100 characters',
  }),
  age: Joi.number().integer().min(18).max(100).messages({
    'number.min': 'Age must be at least 18',
    'number.max': 'Age must not exceed 100',
  }),
  designation: Joi.string().min(2).max(100),
  hiring_date: Joi.date().iso(),
  date_of_birth: Joi.date().iso(),
  salary: Joi.number().positive().precision(2),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

export const employeeQuerySchema: Joi.ObjectSchema = Joi.object({
  search: Joi.string().allow('').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

export const employeeParamSchema: Joi.ObjectSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Employee ID must be a number',
    'any.required': 'Employee ID is required',
  }),
});
