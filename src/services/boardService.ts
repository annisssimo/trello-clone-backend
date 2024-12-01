import Board from '../models/Board';
import { HttpError } from '../utils/httpError';
import { STATUS_CODES } from '../constants/httpStatusCodes';
import { ERROR_MESSAGES } from '../constants/errorMessages';
import UserActionLogsService from '../services/userActionLogsService';

class BoardService {
  public async getAllBoards() {
    return await Board.findAll({ raw: true });
  }

  public async createBoard(title: string) {
    const board = await Board.create({ title });
    const userAction = `User created the board ${title}`;

    UserActionLogsService.createUserActionLog(userAction);
    return board.get({ plain: true });
  }

  public async updateBoard(id: string, title: string) {
    const board = await Board.findByPk(id);

    if (!board) {
      throw new HttpError(
        ERROR_MESSAGES.BOARD_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }

    await board.update({ title });

    const updatedBoardPlain = board.get({ plain: true });

    const userAction = `User updated the board title to ${updatedBoardPlain.title}`;
    UserActionLogsService.createUserActionLog(userAction);

    return updatedBoardPlain;
  }

  public async deleteBoard(id: string) {
    const board = await Board.findByPk(id);

    if (!board) {
      throw new HttpError(
        ERROR_MESSAGES.BOARD_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }

    const deletedBoardPlain = board.get({ plain: true });

    await board.destroy();

    const userAction = `User deleted the board ${deletedBoardPlain.title}`;
    UserActionLogsService.createUserActionLog(userAction);
  }
}

export default new BoardService();
