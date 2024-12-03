import { Request, Response, NextFunction } from 'express';
import TaskService from '../services/taskService';
import { STATUS_CODES } from '../constants/httpStatusCodes';

class TaskController {
  public async getTasks(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { listId } = req.params;
      const tasks = await TaskService.getTasksByList(Number(listId));

      res.status(STATUS_CODES.SUCCESS).json(tasks);
    } catch (error) {
      next(error);
    }
  }

  public async createTask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { title, description, listId } = req.body;

      const task = await TaskService.createTask(
        title,
        description,
        Number(listId)
      );

      res.status(STATUS_CODES.CREATED).json(task);
    } catch (error) {
      next(error);
    }
  }

  public async updateTask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const { title, description } = req.body;

      const task = await TaskService.updateTask(Number(id), title, description);

      res.status(STATUS_CODES.SUCCESS).json(task);
    } catch (error) {
      next(error);
    }
  }

  public async deleteTask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      await TaskService.deleteTask(Number(id));

      res
        .status(STATUS_CODES.NO_CONTENT)
        .json({ message: `Task ${id} was deleted` });
    } catch (error) {
      next(error);
    }
  }

  public async reorderTasks(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { listId } = req.params;

      const { orderedTaskIds } = req.body; // array tasks IDs in the mew order

      await TaskService.reorderTasks(Number(listId), orderedTaskIds);

      res
        .status(STATUS_CODES.SUCCESS)
        .json({ message: 'Tasks reordered successfully' });
    } catch (error) {
      next(error);
    }
  }

  public async moveTaskToList(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { taskId, fromListId, toListId, targetTaskId } = req.body;

      const updatedLists = await TaskService.moveTaskToList(
        Number(taskId),
        Number(fromListId),
        Number(toListId),
        targetTaskId ? Number(targetTaskId) : null
      );

      res
        .status(STATUS_CODES.SUCCESS)
        .json({ message: 'Task moved successfully', updatedLists });
    } catch (error) {
      next(error);
    }
  }
}

export default new TaskController();
