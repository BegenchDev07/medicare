import { Request, Response } from 'express';
import pool from '../db/config';

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const [users] = await pool.query(
      'SELECT id, first_name, last_name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching users'
    });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin or Self
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [users] = await pool.query(
      'SELECT id, first_name, last_name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    const user = (users as any[])[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching user'
    });
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin or Self
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email } = req.body;

    // Check if email is taken by another user
    if (email) {
      const [existingUsers] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );

      if ((existingUsers as any[]).length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use'
        });
      }
    }

    // Update user
    const [result] = await pool.query(
      `UPDATE users 
       SET 
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        email = COALESCE(?, email),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [first_name, last_name, email, id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get updated user
    const [users] = await pool.query(
      'SELECT id, first_name, last_name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: (users as any[])[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error updating user'
    });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error deleting user'
    });
  }
};