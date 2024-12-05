import { Request, Response, NextFunction } from 'express';
import ListService from '../services/listService';
import { STATUS_CODES } from '../constants/httpStatusCodes';
import { List } from '../types/types';

class ListController {
  public async getLists(
    req: Request<{ boardId: string }>,
    res: Response<List[]>,
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
    req: Request<unknown, unknown, { title: string; boardId: number }>,
    res: Response<List>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { title, boardId } = req.body;
      const list = await ListService.createList(title, boardId);

      res.status(STATUS_CODES.CREATED).json(list);
    } catch (error) {
      next(error);
    }
  }

  public async updateList(
    req: Request<{ id: string }, unknown, { title: string }>,
    res: Response<List>,
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
    req: Request<{ id: string }>,
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
    req: Request<{ boardId: string }, unknown, ReorderListsRequestBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { boardId } = req.params;
      const { orderedListIds } = req.body;

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

interface ReorderListsRequestBody {
  orderedListIds: number[];
}
