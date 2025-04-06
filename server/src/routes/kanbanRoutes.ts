import express from 'express';
import { auth } from '../middleware/auth';
import * as kanbanController from '../controllers/kanbanController';

const router = express.Router();

// Get Kanban states for a syllabus
router.get('/kanban/:syllabusId', auth, kanbanController.getKanbanStates);

// Update Kanban state for an event
router.post('/kanban/:syllabusId', auth, kanbanController.updateKanbanState);

export default router; 