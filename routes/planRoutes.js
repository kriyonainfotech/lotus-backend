import express from 'express';
import {
  createPlan,
  deletePlan,
  getAllPlans,
  updatePlan,
} from '../controllers/planController.js';
import { isAdmin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, isAdmin, getAllPlans);
router.post('/', protect, isAdmin, createPlan);
router.put('/:id', protect, isAdmin, updatePlan);
router.delete('/:id', protect, isAdmin, deletePlan);

export default router;
