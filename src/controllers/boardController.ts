import { Request, Response, NextFunction } from 'express';
import BoardService from '../services/boardService';
import { STATUS_CODES } from '../constants/httpStatusCodes';
import { Board } from '../types/types';

class BoardController {
  public async getBoards(
    req: Request,
    res: Response<Board[]>,
    next: NextFunction
  ): Promise<void> {
    try {
      const boards = await BoardService.getAllBoards();
      res.status(STATUS_CODES.SUCCESS).json(boards);
    } catch (error) {
      next(error);
    }
  }

  public async getBoardWithListsAndTasks(
    req: Request<{ id: string }>,
    res: Response<Board>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const boardWithListsAndTasks =
        await BoardService.getBoardWithListsAndTasks(Number(id));

      res.status(STATUS_CODES.SUCCESS).json(boardWithListsAndTasks);
    } catch (error) {
      next(error);
    }
  }

  public async createBoard(
    req: Request<unknown, Board, { title: string }>,
    res: Response<Board>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { title } = req.body;
      const board = await BoardService.createBoard(title);

      res.status(STATUS_CODES.CREATED).json(board);
    } catch (error) {
      next(error);
    }
  }

  public async updateBoard(
    req: Request<{ id: string }, Board, { title: string }>,
    res: Response<Board>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { title } = req.body;

      const board = await BoardService.updateBoard(Number(id), title);

      res.status(STATUS_CODES.SUCCESS).json(board);
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

      await BoardService.deleteBoard(Number(id));
      res
        .status(STATUS_CODES.NO_CONTENT)
        .json({ message: `Board ${id} was deleted` });
    } catch (error) {
      next(error);
    }
  }
}

export default new BoardController();
