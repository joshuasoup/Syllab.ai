import { Router } from 'express';
import { auth } from '../middleware/auth';
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

// Use any type as a workaround for now
router.post('/', createFolder as any);
router.get('/', getFolders as any);
router.put('/:id', updateFolder as any);
router.delete('/:id', deleteFolder as any);
router.post('/reorder', reorderFolders as any);
router.post('/add-position-column', addPositionColumn as any);

export default router; 
