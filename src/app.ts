import express from 'express';
import cors from 'cors';

import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

const HOST = process.env.HOST;
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server is running on http://${HOST}:${PORT}`)
);
