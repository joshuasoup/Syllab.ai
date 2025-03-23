import express from 'express';
import { getCurrentUser, updateUserProfile } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get current user
router.get('/user', auth, getCurrentUser);

// Update user profile
router.patch('/user', auth, updateUserProfile);

export default router; 