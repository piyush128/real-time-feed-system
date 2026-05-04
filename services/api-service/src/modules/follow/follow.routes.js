import express from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { followController , acceptFollowRequestController, rejectFollowRequestController} from './follow.controller.js';

const router = express.Router();

router.post('/:userId', authMiddleware, followController);
router.patch('/:followerId/accept', authMiddleware, acceptFollowRequestController);
router.patch('/:followerId/reject', authMiddleware, rejectFollowRequestController);

export default router;