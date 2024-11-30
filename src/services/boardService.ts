import Board from '../models/Board';
import { HttpError } from '../utils/httpError';
import { STATUS_CODES } from '../constants/httpStatusCode';
import { ERROR_MESSAGES } from '../constants/errorMessages';

class BoardService {
  public async getAllBoards() {
    return await Board.findAll({ raw: true });
  }

  public async createBoard(title: string) {
    const board = await Board.create({ title });
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

    return board.get({ plain: true });
  }

  public async deleteBoard(id: string) {
    const board = await Board.findByPk(id);
    if (!board) {
      throw new HttpError(
        ERROR_MESSAGES.BOARD_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }
    await board.destroy();
  }
}

export default new BoardService();
