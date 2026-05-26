import express from 'express';
import {
  createOrder,
  getActivePlans,
  getSubscriptionStatus,
  verifyPayment,
} from '../controllers/purchaseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/plans', getActivePlans);
router.get('/status', protect, getSubscriptionStatus);
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

export default router;
