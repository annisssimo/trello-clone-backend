import express from 'express';
import taskController from '../controllers/taskController';

const router = express.Router();

router.get('/:listId', taskController.getTasks);
router.post('/', taskController.createTask);
router.put('/reorder/:listId', taskController.reorderTasks);
router.put('/move', taskController.moveTaskToList);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;
