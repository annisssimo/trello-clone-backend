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
    const tasks = await Task.findAll({ where: { listId }, raw: true });

    const formattedTasks = tasks.map((task) => {
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        listId: task.listId,
        taskOrder: task.taskOrder,
      };
    });

    return formattedTasks;
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

      const plainTask = task.get({ plain: true });

      const formattedTask = {
        id: plainTask.id,
        title: plainTask.title,
        description: plainTask.description,
        listId: plainTask.listId,
        taskOrder: plainTask.taskOrder,
      };

      return formattedTask;
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

      const plainTask = task.get({ plain: true });

      const formattedTask = {
        id: plainTask.id,
        title: plainTask.title,
        description: plainTask.description,
        listId: plainTask.listId,
        taskOrder: plainTask.taskOrder,
      };

      return formattedTask;
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

      await task.destroy({ transaction });

      const deletedTaskPlain = task.get({ plain: true });

      const userAction = `User deleted ${deletedTaskPlain.title} task`;
      await UserActionLogsService.createUserActionLog(userAction, transaction);
    });
  }

  public async reorderTasks(listId: number, orderedTaskIds: number[]) {
    return await sequelize.transaction(async (transaction: Transaction) => {
      const tasksToUpdate = orderedTaskIds.map((taskId, index) => ({
        id: taskId,
        listId,
        taskOrder: index + 1,
        title: '',
      }));

      await Task.bulkCreate(tasksToUpdate, {
        updateOnDuplicate: ['taskOrder'],
        transaction,
      });
    });
  }

  public async moveTaskToList(
    taskId: number,
    fromListId: number,
    toListId: number,
    targetTaskId: number | null
  ) {
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

      // Update orders in the source list
      let taskOrder = 1;
      const tasksToUpdateInSource = tasksFromList
        .filter((t) => t.id !== taskId)
        .map((t) => ({
          id: t.id,
          listId: fromListId,
          taskOrder: taskOrder++,
          title: '',
        }));

      if (tasksToUpdateInSource.length > 0) {
        await Task.bulkCreate(tasksToUpdateInSource, {
          updateOnDuplicate: ['taskOrder'],
          transaction,
        });
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

      await Task.update(
        { listId: toListId, taskOrder: newTaskOrder },
        {
          where: { id: taskId },
          transaction,
        }
      );

      taskOrder = 1;
      const tasksToUpdateInDestination = [];
      for (let i = 0; i <= tasksToList.length; i++) {
        if (i === targetIndex) {
          taskOrder++;
        }
        if (tasksToList[i]) {
          tasksToUpdateInDestination.push({
            id: tasksToList[i].id,
            listId: toListId,
            taskOrder: taskOrder++,
            title: '',
          });
        }
      }

      if (tasksToUpdateInDestination.length > 0) {
        await Task.bulkCreate(tasksToUpdateInDestination, {
          updateOnDuplicate: ['taskOrder'],
          transaction,
        });
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
