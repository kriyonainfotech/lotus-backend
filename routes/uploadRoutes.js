import express from 'express';
import { upload, handleUpload } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/upload/profile
 * Protected via authMiddleware. Expects multipart/form-data with field 'image'.
 */
router.post('/profile', protect, upload.single('image'), handleUpload);

/**
 * POST /api/upload/logo
 * Protected via authMiddleware. Expects multipart/form-data with field 'image'.
 */
router.post('/logo', protect, upload.single('image'), handleUpload);

export default router;
