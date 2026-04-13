import express from 'express';
import { 
  getAppSettings, 
  updateAppSettings 
} from '../controllers/appSettingsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAppSettings);
router.put('/', protect, updateAppSettings);

export default router;
