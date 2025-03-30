import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  createFolder,
  getFolders,
  updateFolder,
  deleteFolder
} from '../controllers/folderController';

const router = Router();

// Log all folder requests
router.use((req, res, next) => {
  console.log('Folder request:', {
    method: req.method,
    path: req.path,
    userId: req.user?.id
  });
  next();
});

router.use(auth);

router.post('/', createFolder);
router.get('/', getFolders);
router.put('/:id', updateFolder);
router.delete('/:id', deleteFolder);

export default router; 
