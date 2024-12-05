import { Request, Response } from 'express';

import { STATUS_CODES } from '../constants/httpStatusCodes';
import { ERROR_MESSAGES } from '../constants/errorMessages';

interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response
): void => {
  const statusCode = err.statusCode || STATUS_CODES.SERVER_ERROR;
  const message = err.message || ERROR_MESSAGES.SERVER_ERROR;

  res.status(statusCode).json({
    message,
    status: statusCode,
  });
};
