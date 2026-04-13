import express from 'express';
import { 
  getTemplates, 
  createTemplate, 
  getTemplateById, 
  updateTemplate, 
  deleteTemplate 
} from '../controllers/templateController.js';
import { uploadToCloudinary, middleware as uploadMiddleware } from '../controllers/cloudinaryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Template CRUD
router.get('/', getTemplates);
router.post('/', protect, createTemplate);
router.get('/:id', getTemplateById);
router.put('/:id', protect, updateTemplate);
router.delete('/:id', protect, deleteTemplate);

// Cloudinary Upload
router.post('/upload', protect, uploadMiddleware, uploadToCloudinary);

export default router;
