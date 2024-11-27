import { Sequelize } from 'sequelize-typescript';
import { config } from '../config/database';
import Board from '../models/Board';
import List from '../models/List';
import Task from '../models/Task';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: config.host,
  username: config.username,
  password: config.password,
  database: config.database,
  models: [Board, List, Task],
});
