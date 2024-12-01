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

      const tasksToSend = tasks.map((task) => {
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          listId: task.listId,
          taskOrder: task.taskOrder,
        };
      });

      res.status(STATUS_CODES.SUCCESS).json(tasksToSend);
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

      const taskToSend = {
        id: task.id,
        title: task.title,
        description: task.description,
        listId: task.listId,
        taskOrder: task.taskOrder,
      };

      res.status(STATUS_CODES.CREATED).json(taskToSend);
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

      const taskToSend = {
        id: task.id,
        title: task.title,
        description: task.description,
        listId: task.listId,
        taskOrder: task.taskOrder,
      };

      res.status(STATUS_CODES.SUCCESS).json(taskToSend);
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
      res.status(STATUS_CODES.NO_CONTENT).send();
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
      const { orderedTaskIds } = req.body; // Массив ID задач в новом порядке

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
