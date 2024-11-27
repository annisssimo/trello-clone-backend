import express from 'express';
import listController from '../controllers/listController';

const router = express.Router();

router.get('/:boardId', listController.getLists);
router.post('/', listController.createList);
router.put('/:id', listController.updateList);
router.delete('/:id', listController.deleteList);

export default router;
