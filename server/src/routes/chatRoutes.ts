// src/routes/chatRoutes.ts
import express from 'express';
import { auth } from '../middleware/auth';
import * as chatController from '../controllers/chatController';

const router = express.Router();

router.post('/chat', auth, chatController.chatWithSyllabi as express.RequestHandler);

export default router;



