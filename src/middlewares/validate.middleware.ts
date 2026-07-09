import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { HttpException } from '../errors/HttpException';

type ValidationSource = 'body' | 'query' | 'params';

export function validate(schema: Joi.ObjectSchema, source: ValidationSource = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const dataToValidate: Record<string, unknown> = req[source];

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages: string = error.details
        .map((detail: Joi.ValidationErrorItem) => detail.message)
        .join(', ');
      next(HttpException.badRequest(errorMessages));
      return;
    }

    // Replace source data with validated and sanitized values
    req[source] = value;
    next();
  };
}
