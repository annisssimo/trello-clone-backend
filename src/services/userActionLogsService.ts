import { Transaction } from 'sequelize';

import UserActionLogs from '../models/UserActionLogs';

class UserActionLogsService {
  public async getUserActionLogs() {
    return UserActionLogs.findAll({ raw: true });
  }

  public async createUserActionLog(action: string, transaction?: Transaction) {
    await UserActionLogs.create({ action }, { transaction });
  }
}

export default new UserActionLogsService();
