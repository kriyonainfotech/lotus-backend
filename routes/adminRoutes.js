import express from 'express';
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  getDashboardStats
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// For now, using 'protect' as basic auth. 
// In a real app, you'd add an 'admin' middleware check.
router.get('/users', protect, getAllUsers);
router.post('/users', protect, createUser);
router.put('/users/:id', protect, updateUser);
router.delete('/users/:id', protect, deleteUser);
router.get('/stats', protect, getDashboardStats);

export default router;
