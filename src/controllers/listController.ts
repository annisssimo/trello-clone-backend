import { Request, Response, NextFunction } from 'express';
import ListService from '../services/listService';
import { STATUS_CODES } from '../constants/httpStatusCodes';

class ListController {
  public async getLists(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { boardId } = req.params;

      const lists = await ListService.getListsByBoard(Number(boardId));

      const listsToSend = lists.map((list) => {
        return {
          id: list.id,
          title: list.title,
          boardId: list.boardId,
          listOrder: list.listOrder,
        };
      });

      res.status(STATUS_CODES.SUCCESS).json(listsToSend);
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

      const listToSend = {
        id: list.id,
        title: list.title,
        boardId: list.boardId,
        listOrder: list.listOrder,
      };

      res.status(STATUS_CODES.CREATED).json(listToSend);
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

      const listToSend = {
        id: list.id,
        title: list.title,
        boardId: list.boardId,
        listOrder: list.listOrder,
      };

      res.status(STATUS_CODES.SUCCESS).json(listToSend);
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
      res
        .status(STATUS_CODES.NO_CONTENT)
        .json({ message: 'List deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  public async reorderLists(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { boardId } = req.params;
      const { orderedListIds } = req.body; // Массив ID листов в новом порядке

      await ListService.reorderLists(Number(boardId), orderedListIds);
      res
        .status(STATUS_CODES.SUCCESS)
        .json({ message: 'Lists reordered successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default new ListController();
