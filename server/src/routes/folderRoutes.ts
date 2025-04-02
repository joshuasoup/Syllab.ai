import { Router } from 'express';
import { auth, AuthenticatedRequest } from '../middleware/auth';
import {
  createFolder,
  getFolders,
  updateFolder,
  deleteFolder,
  reorderFolders,
  addPositionColumn
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
router.post('/reorder', reorderFolders);
router.post('/add-position-column', addPositionColumn);

export default router; 
