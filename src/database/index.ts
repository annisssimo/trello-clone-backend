import { sequelize } from './sequelize';
import '../models/Board';
import '../models/List';
import '../models/Task';

async function initializeDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    await sequelize.sync({ alter: true });
    console.log('Database synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

export { sequelize, initializeDatabase };
