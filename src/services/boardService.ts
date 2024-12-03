import Board from '../models/Board';
import { HttpError } from '../utils/httpError';
import { STATUS_CODES } from '../constants/httpStatusCodes';
import { ERROR_MESSAGES } from '../constants/errorMessages';
import UserActionLogsService from '../services/userActionLogsService';
import { sequelize } from '../database/sequelize';

class BoardService {
  public async getAllBoards() {
    return await Board.findAll({ raw: true });
  }

  public async createBoard(title: string) {
    return await sequelize.transaction(async (transaction) => {
      const board = await Board.create({ title }, { transaction });
      const userAction = `User created the board ${title}`;

      await UserActionLogsService.createUserActionLog(userAction, transaction);

      return board.get({ plain: true });
    });
  }

  public async updateBoard(id: string, title: string) {
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

      return updatedBoardPlain;
    });
  }

  public async deleteBoard(id: string) {
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
