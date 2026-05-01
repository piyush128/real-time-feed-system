import express from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { createPostController } from './posts.controller.js';

const router =  express.Router();

router.post('/', authMiddleware, createPostController);

export default router;