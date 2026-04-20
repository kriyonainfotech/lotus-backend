import express from 'express';
import { activatePlan } from '../controllers/purchaseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/activate', protect, activatePlan);

export default router;
