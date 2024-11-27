import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { initializeDatabase } from './database/index';
import { errorHandler } from './middleware/errorMiddleware';
import boardRoutes from './routes/boardRoutes';
import listRoutes from './routes/listRoutes';
import taskRoutes from './routes/taskRoutes';

dotenv.config();

const app = express();

const HOST = process.env.HOST;
const PORT = process.env.PORT || 3000;

initializeDatabase();

app.use(cors());
app.use(express.json());
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/tasks', taskRoutes);
app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server is running on http://${HOST}:${PORT}`)
);
