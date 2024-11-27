import { Request, Response, NextFunction } from 'express';
import ListService from '../services/listService';
import { STATUS_CODES } from '../constants/httpStatusCode';

class ListController {
  public async getLists(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { boardId } = req.params;
      const lists = await ListService.getListsByBoard(Number(boardId));
      res.status(STATUS_CODES.SUCCESS).json(lists);
    } catch (error) {
      next(error);
    }
  }

  public async createList(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { title, boardId } = req.body;
      const list = await ListService.createList(title, Number(boardId));
      res.status(STATUS_CODES.CREATED).json(list);
    } catch (error) {
      next(error);
    }
  }

  public async updateList(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const list = await ListService.updateList(Number(id), title);
      res.status(STATUS_CODES.SUCCESS).json(list);
    } catch (error) {
      next(error);
    }
  }

  public async deleteList(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await ListService.deleteList(Number(id));
      res.status(STATUS_CODES.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new ListController();
