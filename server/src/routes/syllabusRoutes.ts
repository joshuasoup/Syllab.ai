// src/routes/syllabusRoutes.ts
import express from 'express';
import multer from 'multer';
import { auth, preventCrossUserDataAccess } from '../middleware/auth';
import * as syllabusController from '../controllers/syllabusController';

const router = express.Router();

// Configure multer for temporary file storage
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed') as any, false);
    }
  }
});

// Use type assertion to fix the TypeScript error
router.post('/', auth, upload.single('file'), 
  syllabusController.createSyllabus as express.RequestHandler
);

router.post('/:id/process', auth, 
  syllabusController.processSyllabus as express.RequestHandler
);

router.get('/', auth, 
  syllabusController.getUserSyllabi as express.RequestHandler
);

router.get('/:id', auth, 
  syllabusController.getSyllabus as express.RequestHandler
);

router.delete('/:id', auth, 
  syllabusController.deleteSyllabus as express.RequestHandler
);

router.patch('/:id', auth, 
  syllabusController.updateSyllabus as express.RequestHandler
);

export default router;



