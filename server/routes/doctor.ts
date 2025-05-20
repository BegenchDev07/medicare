import express from 'express';
import { getDoctorStats } from '../controllers/doctorController';
import { authenticateToken, isDoctor } from '../middleware/auth';

const router = express.Router();

/**
 * @route   GET /api/doctor/stats
 * @desc    Get doctor statistics
 * @access  Private/Doctor
 */
router.get('/stats', authenticateToken, isDoctor, getDoctorStats);

export default router;