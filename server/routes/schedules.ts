import express from 'express';
import {
  getSchedules,
  getDoctorSchedule,
  getDoctorAvailableSlots,
  createSchedule,
  updateSchedule,
  deleteSchedule
} from '../controllers/scheduleController';
import { authenticateToken, isAdmin, isDoctor, isAdminOrDoctor } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createScheduleSchema, updateScheduleSchema } from '../utils/validation';

const router = express.Router();

/**
 * @route   GET /api/schedules
 * @desc    Get all schedules (Admin only)
 * @access  Private/Admin
 */
router.get('/', authenticateToken, isAdmin, getSchedules);

/**
 * @route   GET /api/schedules/doctor/:doctorId
 * @desc    Get schedules for a specific doctor
 * @access  Public
 */
router.get('/doctor/:doctorId', getDoctorSchedule);

/**
 * @route   GET /api/schedules/doctor/:doctorId/available
 * @desc    Get available time slots for a specific doctor
 * @access  Public
 */
router.get('/doctor/:doctorId/available', getDoctorAvailableSlots);

/**
 * @route   POST /api/schedules
 * @desc    Create a new schedule (Doctor for self or Admin for any doctor)
 * @access  Private/Doctor or Admin
 */
router.post(
  '/',
  authenticateToken,
  isAdminOrDoctor,
  validateRequest(createScheduleSchema),
  createSchedule
);

/**
 * @route   PUT /api/schedules/:id
 * @desc    Update a schedule (Doctor for self or Admin for any doctor)
 * @access  Private/Doctor or Admin
 */
router.put(
  '/:id',
  authenticateToken,
  isAdminOrDoctor,
  validateRequest(updateScheduleSchema),
  updateSchedule
);

/**
 * @route   DELETE /api/schedules/:id
 * @desc    Delete a schedule (Doctor for self or Admin for any doctor)
 * @access  Private/Doctor or Admin
 */
router.delete('/:id', authenticateToken, isAdminOrDoctor, deleteSchedule);

export default router;