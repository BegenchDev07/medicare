import express from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorsByCategory,
} from '../controllers/doctorController';
import { authenticateToken, isAdmin, isAdminOrSelf } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createDoctorSchema, updateDoctorSchema } from '../utils/validation';

const router = express.Router();

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors
 * @access  Public
 */
router.get('/', getDoctors);

/**
 * @route   GET /api/doctors/category/:categoryId
 * @desc    Get doctors by category
 * @access  Public
 */
router.get('/category/:categoryId', getDoctorsByCategory);

/**
 * @route   GET /api/doctors/:id
 * @desc    Get doctor by ID
 * @access  Public
 */
router.get('/:id', getDoctorById);

/**
 * @route   POST /api/doctors
 * @desc    Create a new doctor (Admin only)
 * @access  Private/Admin
 */
router.post(
  '/',
  authenticateToken,
  isAdmin,
  validateRequest(createDoctorSchema),
  createDoctor
);

/**
 * @route   PUT /api/doctors/:id
 * @desc    Update a doctor (Admin or Self)
 * @access  Private/Admin or Self
 */
router.put(
  '/:id',
  authenticateToken,
  isAdmin,
  validateRequest(updateDoctorSchema),
  updateDoctor
);

/**
 * @route   DELETE /api/doctors/:id
 * @desc    Delete a doctor (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', authenticateToken, isAdmin, deleteDoctor);

export default router;