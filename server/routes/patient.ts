import express from 'express';
import { getPatientStats } from '../controllers/patientController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

/**
 * @route   GET /api/patient/stats
 * @desc    Get patient statistics
 * @access  Private
 */
router.get('/stats', authenticateToken, getPatientStats);

export default router;