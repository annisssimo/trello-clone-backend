import Board from '../models/Board';
import List from '../models/List';
import Task from '../models/Task';

import { HttpError } from '../utils/httpError';
import { STATUS_CODES } from '../constants/httpStatusCodes';
import { ERROR_MESSAGES } from '../constants/errorMessages';
import UserActionLogsService from '../services/userActionLogsService';
import { sequelize } from '../database/sequelize';

class BoardService {
  public async getAllBoards() {
    const boards = await Board.findAll({ raw: true });
    const formattedBoards = boards.map((board) => {
      return { id: board.id, title: board.title };
    });
    return formattedBoards;
  }

  public async getBoardWithListsAndTasks(boardId: number) {
    const board = await Board.findByPk(boardId, {
      include: [
        {
          model: List,
          as: 'lists',
          include: [
            {
              model: Task,
              as: 'tasks',
            },
          ],
        },
      ],
    });

    if (!board) {
      throw new HttpError(
        ERROR_MESSAGES.BOARD_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }

    const formattedBoard = JSON.parse(
      JSON.stringify(board, (key, value) => {
        if (key === 'createdAt' || key === 'updatedAt') {
          return undefined;
        }
        return value;
      })
    );

    return formattedBoard;
  }

  public async createBoard(title: string) {
    return await sequelize.transaction(async (transaction) => {
      const board = await Board.create({ title }, { transaction });

      const userAction = `User created the board ${title}`;

      await UserActionLogsService.createUserActionLog(userAction, transaction);

      const plainBoard = board.get({ plain: true });

      const formattedBoard = { id: plainBoard.id, title: plainBoard.title };

      return formattedBoard;
    });
  }

  public async updateBoard(id: number, title: string) {
    return await sequelize.transaction(async (transaction) => {
      const board = await Board.findByPk(id, { transaction });

      if (!board) {
        throw new HttpError(
          ERROR_MESSAGES.BOARD_NOT_FOUND,
          STATUS_CODES.NOT_FOUND
        );
      }

      await board.update({ title }, { transaction });

      const updatedBoardPlain = board.get({ plain: true });

      const userAction = `User updated the board title to ${updatedBoardPlain.title}`;
      await UserActionLogsService.createUserActionLog(userAction, transaction);

      const formattedBoard = {
        id: updatedBoardPlain.id,
        title: updatedBoardPlain.title,
      };

      return formattedBoard;
    });
  }

  public async deleteBoard(id: number) {
    return await sequelize.transaction(async (transaction) => {
      const board = await Board.findByPk(id, { transaction });

      if (!board) {
        throw new HttpError(
          ERROR_MESSAGES.BOARD_NOT_FOUND,
          STATUS_CODES.NOT_FOUND
        );
      }

      const deletedBoardPlain = board.get({ plain: true });
      await board.destroy({ transaction });

      const userAction = `User deleted the board ${deletedBoardPlain.title}`;
      await UserActionLogsService.createUserActionLog(userAction, transaction);
    });
  }
}

export default new BoardService();
