import List from '../models/List';
import Task from '../models/Task';
import { HttpError } from '../utils/httpError';
import { STATUS_CODES } from '../constants/httpStatusCode';
import { ERROR_MESSAGES } from '../constants/errorMessages';

class ListService {
  public async getListsByBoard(boardId: number) {
    return await List.findAll({ where: { boardId }, include: [Task] });
  }

  public async createList(title: string, boardId: number) {
    return await List.create({ title, boardId });
  }

  public async updateList(id: number, title: string) {
    const list = await List.findByPk(id);
    if (!list) {
      throw new HttpError(
        ERROR_MESSAGES.LIST_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }
    await list.update({ title });
    return list;
  }

  public async deleteList(id: number) {
    const list = await List.findByPk(id);
    if (!list) {
      throw new HttpError(
        ERROR_MESSAGES.LIST_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }
    await list.destroy();
  }
}

export default new ListService();
