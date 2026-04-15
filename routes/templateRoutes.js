import express from 'express';
import { 
  getTemplates, 
  createTemplate, 
  getTemplateById, 
  updateTemplate, 
  deleteTemplate 
} from '../controllers/templateController.js';
import { uploadToCloudinary, getMediaList, deleteMedia, syncMedia, middleware as uploadMiddleware } from '../controllers/cloudinaryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Cloudinary Media Library
router.get('/media', protect, getMediaList);
router.post('/media/sync', protect, syncMedia);
router.delete('/media/:id(*)', protect, deleteMedia);
router.post('/upload', protect, uploadMiddleware, uploadToCloudinary);

// Template CRUD
router.get('/', getTemplates);
router.post('/', protect, createTemplate);
router.get('/:id', getTemplateById);
router.put('/:id', protect, updateTemplate);
router.delete('/:id', protect, deleteTemplate);


export default router;
