import { Transaction } from 'sequelize';

import Task from '../models/Task';
import List from '../models/List';
import { HttpError } from '../utils/httpError';
import { STATUS_CODES } from '../constants/httpStatusCodes';
import { ERROR_MESSAGES } from '../constants/errorMessages';
import UserActionLogsService from '../services/userActionLogsService';
import { sequelize } from '../database/sequelize';

class TaskService {
  public async getTasksByList(listId: number) {
    return await Task.findAll({ where: { listId }, raw: true });
  }

  public async createTask(title: string, description: string, listId: number) {
    return await sequelize.transaction(async (transaction: Transaction) => {
      const list = await List.findByPk(listId, { raw: true, transaction });

      if (!list) {
        throw new HttpError(
          ERROR_MESSAGES.LIST_NOT_FOUND,
          STATUS_CODES.NOT_FOUND
        );
      }

      const maxTaskOrder: number = await Task.max('taskOrder', {
        where: { listId },
        transaction,
      });

      const taskOrder = maxTaskOrder ? maxTaskOrder + 1 : 1;

      const task = await Task.create(
        { title, description, listId, taskOrder },
        { transaction }
      );

      const userAction = `User created ${task.title} task in the ${list.title}`;
      await UserActionLogsService.createUserActionLog(userAction, transaction);

      return task.get({ plain: true });
    });
  }

  public async updateTask(id: number, title: string, description?: string) {
    return await sequelize.transaction(async (transaction: Transaction) => {
      const task = await Task.findByPk(id, { transaction });

      if (!task) {
        throw new HttpError(
          ERROR_MESSAGES.TASK_NOT_FOUND,
          STATUS_CODES.NOT_FOUND
        );
      }

      await task.update({ title, description }, { transaction });

      const userAction = `User updated ${task.title} task`;
      await UserActionLogsService.createUserActionLog(userAction, transaction);

      return task.get({ plain: true });
    });
  }

  public async deleteTask(id: number) {
    return await sequelize.transaction(async (transaction: Transaction) => {
      const task = await Task.findByPk(id, { transaction });

      if (!task) {
        throw new HttpError(
          ERROR_MESSAGES.TASK_NOT_FOUND,
          STATUS_CODES.NOT_FOUND
        );
      }

      const deletedTaskPlain = task.get({ plain: true });

      await task.destroy({ transaction });

      const userAction = `User deleted ${deletedTaskPlain.title} task`;
      await UserActionLogsService.createUserActionLog(userAction, transaction);
    });
  }

  public async reorderTasks(listId: number, orderedTaskIds: number[]) {
    return await sequelize.transaction(async (transaction: Transaction) => {
      const tasks = await Task.findAll({ where: { listId }, transaction });

      const tasksMap = new Map(tasks.map((task) => [task.id, task]));
      let taskOrder = 1;

      for (const taskId of orderedTaskIds) {
        const task = tasksMap.get(taskId);

        if (task) {
          await task.update({ taskOrder: taskOrder++ }, { transaction });
        }
      }
    });
  }

  public async moveTaskToList(
    taskId: number,
    fromListId: number,
    toListId: number,
    targetTaskId: number | null
  ): Promise<{ [listId: number]: Task[] }> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      const task = await Task.findByPk(taskId, { transaction });

      if (!task) {
        throw new HttpError(
          ERROR_MESSAGES.TASK_NOT_FOUND,
          STATUS_CODES.NOT_FOUND
        );
      }

      const tasksFromList = await Task.findAll({
        where: { listId: fromListId },
        order: [['taskOrder', 'ASC']],
        transaction,
      });

      let taskOrder = 1;
      for (const t of tasksFromList) {
        if (t.id !== taskId) {
          await t.update({ taskOrder }, { transaction });
          taskOrder++;
        }
      }

      const tasksToList = await Task.findAll({
        where: { listId: toListId },
        order: [['taskOrder', 'ASC']],
        transaction,
      });

      const targetIndex = targetTaskId
        ? tasksToList.findIndex((task) => task.id === targetTaskId)
        : tasksToList.length;

      const newTaskOrder =
        targetIndex !== -1 ? targetIndex + 1 : tasksToList.length + 1;

      await task.update(
        { listId: toListId, taskOrder: newTaskOrder },
        { transaction }
      );

      taskOrder = 1;
      for (let i = 0; i <= tasksToList.length; i++) {
        if (i === targetIndex) {
          taskOrder++;
        }
        if (tasksToList[i]) {
          await tasksToList[i].update({ taskOrder }, { transaction });
          taskOrder++;
        }
      }

      const taskTitlePlain = task.get({ plain: true }).title;
      const toList = await List.findByPk(toListId, { raw: true, transaction });

      const userAction = `User moved ${taskTitlePlain} task to list ${toList?.title}`;
      await UserActionLogsService.createUserActionLog(userAction, transaction);

      await transaction.commit();

      return {
        [fromListId]: await this.getTasksByList(fromListId),
        [toListId]: await this.getTasksByList(toListId),
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new TaskService();
