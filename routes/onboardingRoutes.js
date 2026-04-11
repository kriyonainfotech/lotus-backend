import express from 'express';
import {
  getIndustries,
  saveBusinessDetails,
  completeUserProfile,
} from '../controllers/onboardingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public — no auth needed
router.get('/industries', getIndustries);

// Protected — need Firebase ID token
router.post('/business', protect, saveBusinessDetails);
router.put('/profile', protect, completeUserProfile);

export default router;
