import Task from '../models/Task';
import List from '../models/List';
import { HttpError } from '../utils/httpError';
import { STATUS_CODES } from '../constants/httpStatusCode';
import { ERROR_MESSAGES } from '../constants/errorMessages';

class TaskService {
  public async getTasksByList(listId: number) {
    return await Task.findAll({ where: { listId } });
  }

  public async createTask(title: string, description: string, listId: number) {
    const list = await List.findByPk(listId);

    if (!list) {
      throw new HttpError(
        ERROR_MESSAGES.LIST_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }

    const maxTaskOrder: number = await Task.max('taskOrder', {
      where: { listId },
    });

    const taskOrder = maxTaskOrder ? maxTaskOrder + 1 : 1;

    return await Task.create({ title, description, listId, taskOrder });
  }

  public async updateTask(id: number, title: string, description?: string) {
    const task = await Task.findByPk(id);
    if (!task) {
      throw new HttpError(
        ERROR_MESSAGES.TASK_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }
    await task.update({ title, description });
    return task;
  }

  public async deleteTask(id: number) {
    const task = await Task.findByPk(id);
    if (!task) {
      throw new HttpError(
        ERROR_MESSAGES.TASK_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }
    await task.destroy();
  }

  async reorderTasks(listId: number, orderedTaskIds: number[]): Promise<void> {
    console.log(listId);
    console.log(orderedTaskIds);
    const tasks = await Task.findAll({ where: { listId } });

    console.log(tasks);

    const tasksMap = new Map(tasks.map((task) => [task.id, task]));
    console.log(tasksMap);
    let taskOrder = 1;

    for (const taskId of orderedTaskIds) {
      const task = tasksMap.get(taskId);

      if (task) {
        await task.update({ taskOrder: taskOrder++ });
      }
    }
  }
}

export default new TaskService();
