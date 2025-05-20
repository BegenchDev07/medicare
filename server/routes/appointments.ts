import express from 'express';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getDoctorAppointments,
  getPatientAppointments,
} from '../controllers/appointmentController';
import { authenticateToken, isAdmin, isDoctor } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createAppointmentSchema, updateAppointmentSchema } from '../utils/validation';

const router = express.Router();

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments (Admin only)
 * @access  Private/Admin
 */
router.get('/', authenticateToken, isAdmin, getAppointments);

/**
 * @route   GET /api/appointments/doctor
 * @desc    Get appointments for the logged-in doctor
 * @access  Private/Doctor
 */
router.get('/doctor', authenticateToken, isDoctor, getDoctorAppointments);

/**
 * @route   GET /api/appointments/patient
 * @desc    Get appointments for the logged-in patient
 * @access  Private
 */
router.get('/patient', authenticateToken, getPatientAppointments);

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Private
 */
router.post(
  '/',
  authenticateToken,
  validateRequest(createAppointmentSchema),
  createAppointment
);

/**
 * @route   PUT /api/appointments/:id
 * @desc    Update an appointment (status change by doctor or admin)
 * @access  Private/Doctor or Admin
 */
router.put(
  '/:id',
  authenticateToken,
  validateRequest(updateAppointmentSchema),
  updateAppointment
);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Cancel an appointment
 * @access  Private
 */
router.delete('/:id', authenticateToken, cancelAppointment);

export default router;