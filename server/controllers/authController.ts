import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/config';
import { asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '../types';

// Get JWT secret from environment or use default
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Login user
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  debugger;
  try {
    // Find user by email
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    const user = (users as any[])[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No such user',
      });
    }

    // Check password
    const isMatch = (password === user.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data with token
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during login',
    });
  }
});

// Register new user
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, role = UserRole.PATIENT } = req.body;

  try {
    // Input validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
      });
    }

    // Check if email already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if ((existingUsers as any[]).length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email already in use',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in database
    const [result] = await pool.query(
      'INSERT INTO users (id, first_name, last_name, email, password, role) VALUES (UUID(), ?, ?, ?, ?, ?)',
      [firstName, lastName, email, password, role]
    );

    const [newUser] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [(result as any).insertId]
    );

    const user = (newUser as any[])[0];

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data with token
    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred during registration',
    });
  }
});