import Task from '../models/Task';
import List from '../models/List';
import { HttpError } from '../utils/httpError';
import { STATUS_CODES } from '../constants/httpStatusCodes';
import { ERROR_MESSAGES } from '../constants/errorMessages';
import UserActionLogsService from '../services/userActionLogsService';

class TaskService {
  public async getTasksByList(listId: number) {
    return await Task.findAll({ where: { listId }, raw: true });
  }

  public async createTask(title: string, description: string, listId: number) {
    const list = await List.findByPk(listId, { raw: true });

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

    const task = await Task.create({ title, description, listId, taskOrder });

    const taskPlain = task.get({ plain: true });

    const userAction = `User created ${taskPlain.title} task in the ${list.title}`;
    UserActionLogsService.createUserActionLog(userAction);

    return taskPlain;
  }

  public async updateTask(id: number, title: string, description?: string) {
    const task = await Task.findByPk(id);

    if (!task) {
      throw new HttpError(
        ERROR_MESSAGES.TASK_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }

    const updatedTask = await task.update({ title, description });
    const updatedTaskPlain = updatedTask.get({ plain: true });

    const userAction = `User updated ${updatedTaskPlain.title} task`;
    UserActionLogsService.createUserActionLog(userAction);

    return updatedTaskPlain;
  }

  public async deleteTask(id: number) {
    const task = await Task.findByPk(id);

    if (!task) {
      throw new HttpError(
        ERROR_MESSAGES.TASK_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }

    const deletedTaskPlain = task.get({ plain: true });

    await task.destroy();

    const userAction = `User deleted ${deletedTaskPlain.title} task`;
    UserActionLogsService.createUserActionLog(userAction);
  }

  async reorderTasks(listId: number, orderedTaskIds: number[]): Promise<void> {
    const tasks = await Task.findAll({ where: { listId } });

    const tasksMap = new Map(tasks.map((task) => [task.id, task]));
    let taskOrder = 1;

    for (const taskId of orderedTaskIds) {
      const task = tasksMap.get(taskId);

      if (task) {
        await task.update({ taskOrder: taskOrder++ });
      }
    }
  }

  public async moveTaskToList(
    taskId: number,
    fromListId: number,
    toListId: number,
    targetTaskId: number | null
  ): Promise<{ [listId: number]: Task[] }> {
    const task = await Task.findByPk(taskId);

    if (!task) {
      throw new HttpError(
        ERROR_MESSAGES.TASK_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }

    const tasksFromList = await Task.findAll({
      where: { listId: fromListId },
      order: [['taskOrder', 'ASC']],
    });

    let taskOrder = 1;
    for (const t of tasksFromList) {
      if (t.id !== taskId) {
        await t.update({ taskOrder });
        taskOrder++;
      }
    }

    const tasksToList = await Task.findAll({
      where: { listId: toListId },
      order: [['taskOrder', 'ASC']],
    });

    const targetIndex = targetTaskId
      ? tasksToList.findIndex((task) => task.id === targetTaskId)
      : tasksToList.length;

    const newTaskOrder =
      targetIndex !== -1 ? targetIndex + 1 : tasksToList.length + 1;

    await task.update({ listId: toListId, taskOrder: newTaskOrder });

    taskOrder = 1;
    for (let i = 0; i <= tasksToList.length; i++) {
      if (i === targetIndex) {
        taskOrder++;
      }
      if (tasksToList[i]) {
        await tasksToList[i].update({ taskOrder });
        taskOrder++;
      }
    }

    const taskTitlePlain = task.get({ plain: true }).title;
    const toList = await List.findByPk(toListId, { raw: true });

    const userAction = `User moved ${taskTitlePlain} task to list ${toList?.title}`;
    await UserActionLogsService.createUserActionLog(userAction);

    return {
      [fromListId]: await this.getTasksByList(fromListId),
      [toListId]: await this.getTasksByList(toListId),
    };
  }
}

export default new TaskService();
