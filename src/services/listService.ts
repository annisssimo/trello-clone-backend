import List from '../models/List';
import Task from '../models/Task';
import { HttpError } from '../utils/httpError';
import { STATUS_CODES } from '../constants/httpStatusCode';
import { ERROR_MESSAGES } from '../constants/errorMessages';
import Board from '../models/Board';

class ListService {
  public async getListsByBoard(boardId: number) {
    return await List.findAll({ where: { boardId }, include: [Task] });
  }

  public async createList(title: string, boardId: number) {
    const board = await Board.findByPk(boardId);

    if (!board) {
      throw new HttpError(
        ERROR_MESSAGES.BOARD_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }

    const maxListOrder: number = await List.max('listOrder', {
      where: { boardId },
    });

    const listOrder = maxListOrder ? maxListOrder + 1 : 1;
    return await List.create({ title, boardId, listOrder });
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

  async reorderLists(boardId: number, orderedListIds: number[]): Promise<void> {
    const lists = await List.findAll({ where: { boardId } });

    const listsMap = new Map(lists.map((list) => [list.id, list]));
    let listOrder = 1;

    for (const listId of orderedListIds) {
      const list = listsMap.get(listId);
      if (list) {
        await list.update({ listOrder: listOrder++ });
      }
    }
  }
}

export default new ListService();
