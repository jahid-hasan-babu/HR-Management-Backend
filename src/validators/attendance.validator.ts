import Joi from 'joi';

export const createAttendanceSchema: Joi.ObjectSchema = Joi.object({
  employee_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Employee ID must be a number',
    'any.required': 'Employee ID is required',
  }),
  date: Joi.date().iso().required().messages({
    'date.format': 'Date must be in ISO date format (YYYY-MM-DD)',
    'any.required': 'Date is required',
  }),
  check_in_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
    .required()
    .messages({
      'string.pattern.base': 'Check-in time must be in HH:MM or HH:MM:SS format',
      'any.required': 'Check-in time is required',
    }),
});

export const updateAttendanceSchema: Joi.ObjectSchema = Joi.object({
  employee_id: Joi.number().integer().positive(),
  date: Joi.date().iso(),
  check_in_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
    .messages({
      'string.pattern.base': 'Check-in time must be in HH:MM or HH:MM:SS format',
    }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

export const attendanceQuerySchema: Joi.ObjectSchema = Joi.object({
  employee_id: Joi.number().integer().positive().optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

export const attendanceParamSchema: Joi.ObjectSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Attendance ID must be a number',
    'any.required': 'Attendance ID is required',
  }),
});

export const reportQuerySchema: Joi.ObjectSchema = Joi.object({
  month: Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
    .required()
    .messages({
      'string.pattern.base': 'Month must be in YYYY-MM format',
      'any.required': 'Month is required',
    }),
  employee_id: Joi.number().integer().positive().optional(),
});
