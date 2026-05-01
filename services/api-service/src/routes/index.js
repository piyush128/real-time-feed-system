import express from 'express';
import authRouter from '../modules/auth/auth.routes.js';
import postRouter from '../modules/posts/posts.routes.js';
import followRouter from '../modules/follow/follow.routes.js';
import feedRouter from '../modules/feed/feed.routes.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/posts', postRouter);
router.use('/follow', followRouter);
router.use('/feed', feedRouter);

export default router;