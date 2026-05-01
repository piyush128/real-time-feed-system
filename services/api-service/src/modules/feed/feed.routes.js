import express from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { feedController } from './feed.controller.js';

const router = express.Router();

router.get('/', authMiddleware, feedController);

export default router;