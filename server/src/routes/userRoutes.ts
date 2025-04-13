import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  getCurrentUser,
  updateUserProfile,
  getAllUsers,
} from '../controllers/userController';

const router = Router();

// Protected routes
router.get('/user', auth, getCurrentUser);
router.patch('/user', auth, updateUserProfile);
router.get('/user/all', auth, getAllUsers);

export default router;
