import UserActionLogs from '../models/UserActionLogs';

class UserActionLogsService {
  public async getUserActionLogs() {
    return UserActionLogs.findAll({ raw: true });
  }

  public async createUserActionLog(action: string) {
    await UserActionLogs.create({ action });
  }
}

export default new UserActionLogsService();
