import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODES } from '../constants/httpStatusCode';
import { ERROR_MESSAGES } from '../constants/errorMessages';

interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
  const message = err.message || ERROR_MESSAGES.UNEXPECTED_ERROR;

  res.status(statusCode).json({
    message,
    status: statusCode,
  });
};
