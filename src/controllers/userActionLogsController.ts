import { Request, Response, NextFunction } from 'express';
import UserActionLogsService from '../services/userActionLogsService';
import { STATUS_CODES } from '../constants/httpStatusCodes';

class UserActionLogsController {
  public async getUserActionLogs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const logs = await UserActionLogsService.getUserActionLogs();

      const logsToSend = logs.map((log) => {
        return {
          action: log.action,
          date: log.createdAt,
        };
      });

      res.status(STATUS_CODES.SUCCESS).json(logsToSend);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserActionLogsController();
