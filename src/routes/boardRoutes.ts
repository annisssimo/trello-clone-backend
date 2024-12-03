import express from 'express';
import boardController from '../controllers/boardController';

const router = express.Router();

router.get('/', boardController.getBoards);
router.get('/:id', boardController.getBoardWithListsAndTasks);
router.post('/', boardController.createBoard);
router.put('/:id', boardController.updateBoard);
router.delete('/:id', boardController.deleteBoard);

export default router;
