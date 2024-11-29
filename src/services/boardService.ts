import Board from '../models/Board';
import List from '../models/List';
import { HttpError } from '../utils/httpError';
import { STATUS_CODES } from '../constants/httpStatusCode';
import { ERROR_MESSAGES } from '../constants/errorMessages';

class BoardService {
  public async getAllBoards() {
    return await Board.findAll({ include: [List] });
  }

  public async createBoard(title: string) {
    return await Board.create({ title });
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
    return board;
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
