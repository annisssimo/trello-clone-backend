import express from 'express';
import userActionLogsController from '../controllers/userActionLogsController';

const router = express.Router();

router.get('/', userActionLogsController.getUserActionLogs);

export default router;
