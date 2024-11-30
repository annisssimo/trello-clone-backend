import { Request, Response, NextFunction } from 'express';
import BoardService from '../services/boardService';
import { STATUS_CODES } from '../constants/httpStatusCode';

class BoardController {
  public async getBoards(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const boards = await BoardService.getAllBoards();
      const boardsToSend = boards.map((board) => {
        return { id: board.id, title: board.title };
      });
      res.status(STATUS_CODES.SUCCESS).json(boardsToSend);
    } catch (error) {
      next(error);
    }
  }

  public async createBoard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { title } = req.body;
      const board = await BoardService.createBoard(title);

      const boardToSend = { id: board.id, title: board.title };

      res.status(STATUS_CODES.CREATED).json(boardToSend);
    } catch (error) {
      next(error);
    }
  }

  public async updateBoard(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { title } = req.body;

      const board = await BoardService.updateBoard(id, title);

      const boardToSend = { id: board.id, title: board.title };

      res.status(STATUS_CODES.SUCCESS).json(boardToSend);
    } catch (error) {
      next(error);
    }
  }

  public async deleteBoard(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      await BoardService.deleteBoard(id);
      res.status(STATUS_CODES.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new BoardController();
