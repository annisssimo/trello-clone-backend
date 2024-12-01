import List from '../models/List';
import { HttpError } from '../utils/httpError';
import { STATUS_CODES } from '../constants/httpStatusCodes';
import { ERROR_MESSAGES } from '../constants/errorMessages';
import Board from '../models/Board';
import UserActionLogsService from '../services/userActionLogsService';

class ListService {
  public async getListsByBoard(boardId: number) {
    return await List.findAll({
      where: { boardId },
      raw: true,
    });
  }

  public async createList(title: string, boardId: number) {
    const board = await Board.findByPk(boardId, { raw: true });

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

    const list = await List.create({ title, boardId, listOrder });

    const userAction = `User added ${title} list to the ${board.title} board`;
    UserActionLogsService.createUserActionLog(userAction);

    return list.get({ plain: true });
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

    const updatedListPlain = list.get({ plain: true });

    const userAction = `User updated list title to ${updatedListPlain.title}`;
    UserActionLogsService.createUserActionLog(userAction);

    return updatedListPlain;
  }

  public async deleteList(id: number) {
    const list = await List.findByPk(id);

    if (!list) {
      throw new HttpError(
        ERROR_MESSAGES.LIST_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }

    const deletedListPlain = list.get({ plain: true });

    await list.destroy();

    const userAction = `User deleted the list ${deletedListPlain.title}`;
    UserActionLogsService.createUserActionLog(userAction);
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
