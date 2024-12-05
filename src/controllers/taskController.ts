import { Request, Response, NextFunction } from 'express';
import TaskService from '../services/taskService';
import { STATUS_CODES } from '../constants/httpStatusCodes';
import { Task } from '../types/types';

class TaskController {
  public async getTasks(
    req: Request<{ listId: string }>,
    res: Response<Task[]>,
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
    req: Request<unknown, unknown, Omit<Task, 'id' | 'taskOrder'>>,
    res: Response<Task>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { title, description, listId } = req.body;
      const task = await TaskService.createTask(title, listId, description);

      res.status(STATUS_CODES.CREATED).json(task);
    } catch (error) {
      next(error);
    }
  }

  public async updateTask(
    req: Request<{ id: string }, unknown, Pick<Task, 'title' | 'description'>>,
    res: Response<Task>,
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
    req: Request<{ id: string }>,
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
    req: Request<{ listId: string }, unknown, ReorderTasksRequestBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { listId } = req.params;
      const { orderedTaskIds } = req.body;

      await TaskService.reorderTasks(Number(listId), orderedTaskIds);

      res
        .status(STATUS_CODES.SUCCESS)
        .json({ message: 'Tasks reordered successfully' });
    } catch (error) {
      next(error);
    }
  }

  public async moveTaskToList(
    req: Request<unknown, unknown, MoveTaskRequestBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { taskId, fromListId, toListId, targetTaskId } = req.body;

      const updatedLists = await TaskService.moveTaskToList(
        taskId,
        fromListId,
        toListId,
        targetTaskId
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

interface ReorderTasksRequestBody {
  orderedTaskIds: number[];
}

interface MoveTaskRequestBody {
  taskId: number;
  fromListId: number;
  toListId: number;
  targetTaskId: number;
}
