import express from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { followController } from './follow.controller.js';

const router = express.Router();

router.post('/:userId', authMiddleware, followController);

export default router;