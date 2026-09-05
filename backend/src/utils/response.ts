import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: { total?: number; page?: number; limit?: number; totalPages?: number }
) => {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errorCode: string = 'ERROR'
) => {
  const payload: ApiResponse = {
    success: false,
    message,
    error: errorCode,
  };
  return res.status(statusCode).json(payload);
};
