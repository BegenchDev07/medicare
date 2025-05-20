import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticateToken, isAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createCategorySchema, updateCategorySchema } from '../utils/validation';

const router = express.Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', getCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/:id', getCategoryById);

/**
 * @route   POST /api/categories
 * @desc    Create a new category (Admin only)
 * @access  Private/Admin
 */
router.post(
  '/',
  authenticateToken,
  isAdmin,
  validateRequest(createCategorySchema),
  createCategory
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update a category (Admin only)
 * @access  Private/Admin
 */
router.put(
  '/:id',
  authenticateToken,
  isAdmin,
  validateRequest(updateCategorySchema),
  updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', authenticateToken, isAdmin, deleteCategory);

export default router;