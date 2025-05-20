import { Request, Response } from 'express';
import pool from '../db/config';

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const [categories] = await pool.query(
      'SELECT * FROM categories ORDER BY name'
    );

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching categories'
    });
  }
};

/**
 * @desc    Get category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [categories] = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    const category = (categories as any[])[0];

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching category'
    });
  }
};

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    // Check if category name already exists
    const [existingCategories] = await pool.query(
      'SELECT id FROM categories WHERE name = ?',
      [name]
    );

    if ((existingCategories as any[]).length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Category name already exists'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO categories (id, name, description) VALUES (UUID(), ?, ?)',
      [name, description]
    );

    const [newCategory] = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [(result as any).insertId]
    );

    res.status(201).json({
      success: true,
      data: (newCategory as any[])[0]
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error creating category'
    });
  }
};

/**
 * @desc    Update a category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if name is being updated and already exists
    if (name) {
      const [existingCategories] = await pool.query(
        'SELECT id FROM categories WHERE name = ? AND id != ?',
        [name, id]
      );

      if ((existingCategories as any[]).length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Category name already exists'
        });
      }
    }

    const [result] = await pool.query(
      `UPDATE categories 
       SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, description, id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const [categories] = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: (categories as any[])[0]
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error updating category'
    });
  }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error deleting category'
    });
  }
};