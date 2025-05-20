import express from 'express';
import { login, register } from '../controllers/authController';
import { validateRequest } from '../middleware/validation';
import { loginSchema, registerSchema } from '../utils/validation';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login a user
 * @access  Public
 */
router.post('/login', validateRequest(loginSchema), login);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRequest(registerSchema), register);

export default router;