import { Response } from 'express';
import { IApiResponse, IPaginationMeta } from '../types/common.types';

export function sendResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: IPaginationMeta,
): Response {
  const response: IApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    statusCode,
    message,
    data,
    meta,
  };

  return res.status(statusCode).json(response);
}
