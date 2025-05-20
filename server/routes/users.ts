import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { authenticateToken, isAdmin, isAdminOrSelf } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { updateUserSchema } from '../utils/validation';

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/', authenticateToken, isAdmin, getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (Admin or Self)
 * @access  Private
 */
router.get('/:id', authenticateToken, isAdminOrSelf('id'), getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (Admin or Self)
 * @access  Private
 */
router.put(
  '/:id',
  authenticateToken,
  isAdminOrSelf('id'),
  validateRequest(updateUserSchema),
  updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', authenticateToken, isAdmin, deleteUser);

export default router;