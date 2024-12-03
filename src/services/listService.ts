import List from '../models/List';
import { HttpError } from '../utils/httpError';
import { STATUS_CODES } from '../constants/httpStatusCodes';
import { ERROR_MESSAGES } from '../constants/errorMessages';
import Board from '../models/Board';
import UserActionLogsService from '../services/userActionLogsService';
import { sequelize } from '../database/sequelize';

class ListService {
  public async getListsByBoard(boardId: number) {
    const lists = await List.findAll({
      where: { boardId },
      raw: true,
    });

    const formattedLists = lists.map((list) => {
      return {
        id: list.id,
        title: list.title,
        boardId: list.boardId,
        listOrder: list.listOrder,
      };
    });

    return formattedLists;
  }

  public async createList(title: string, boardId: number) {
    return await sequelize.transaction(async (transaction) => {
      const board = await Board.findByPk(boardId, { raw: true, transaction });

      if (!board) {
        throw new HttpError(
          ERROR_MESSAGES.BOARD_NOT_FOUND,
          STATUS_CODES.NOT_FOUND
        );
      }

      const maxListOrder: number = await List.max('listOrder', {
        where: { boardId },
        transaction,
      });

      const listOrder = maxListOrder ? maxListOrder + 1 : 1;

      const list = await List.create(
        { title, boardId, listOrder },
        { transaction }
      );

      const userAction = `User added ${title} list to the ${board.title} board`;
      await UserActionLogsService.createUserActionLog(userAction, transaction);

      const plainList = list.get({ plain: true });

      const formattedList = {
        id: plainList.id,
        title: plainList.title,
        boardId: plainList.boardId,
        listOrder: plainList.listOrder,
      };

      return formattedList;
    });
  }

  public async updateList(id: number, title: string) {
    return await sequelize.transaction(async (transaction) => {
      const list = await List.findByPk(id, { transaction });

      if (!list) {
        throw new HttpError(
          ERROR_MESSAGES.LIST_NOT_FOUND,
          STATUS_CODES.NOT_FOUND
        );
      }

      await list.update({ title }, { transaction });

      const updatedListPlain = list.get({ plain: true });

      const userAction = `User updated list title to ${updatedListPlain.title}`;
      await UserActionLogsService.createUserActionLog(userAction, transaction);

      const formattedUpdatedList = {
        id: updatedListPlain.id,
        title: updatedListPlain.title,
        boardId: updatedListPlain.boardId,
        listOrder: updatedListPlain.listOrder,
      };

      return formattedUpdatedList;
    });
  }

  public async deleteList(id: number) {
    return await sequelize.transaction(async (transaction) => {
      const list = await List.findByPk(id, { transaction });

      if (!list) {
        throw new HttpError(
          ERROR_MESSAGES.LIST_NOT_FOUND,
          STATUS_CODES.NOT_FOUND
        );
      }

      const deletedListPlain = list.get({ plain: true });

      await list.destroy({ transaction });

      const userAction = `User deleted the list ${deletedListPlain.title}`;
      await UserActionLogsService.createUserActionLog(userAction, transaction);
    });
  }

  public async reorderLists(boardId: number, orderedListIds: number[]) {
    return await sequelize.transaction(async (transaction) => {
      const lists = await List.findAll({ where: { boardId }, transaction });

      const listsMap = new Map(lists.map((list) => [list.id, list]));
      let listOrder = 1;

      for (const listId of orderedListIds) {
        const list = listsMap.get(listId);
        if (list) {
          await list.update({ listOrder: listOrder++ }, { transaction });
        }
      }
    });
  }
}

export default new ListService();
