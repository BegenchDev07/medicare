import express from 'express';
import { getAdminStats } from '../controllers/adminController';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard statistics
 * @access  Private/Admin
 */
router.get('/stats', authenticateToken, isAdmin, getAdminStats);

export default router;