import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db/config';
import { asyncHandler } from '../middleware/errorHandler';
import { UserRole, AppointmentStatus } from '../types';

// Get all doctors
export const getDoctors = asyncHandler(async (req: Request, res: Response) => {
  const [doctors] = await pool.query(`
    SELECT d.*, u.first_name, u.last_name, u.email, c.name as categoryName
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    JOIN categories c ON d.category_id = c.id
  `);

  res.json({
    success: true,
    data: doctors,
  });
});

// Get doctor by ID
export const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const [doctors] = await pool.query(`
    SELECT d.*, u.first_name, u.last_name, u.email, c.name as categoryName
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    JOIN categories c ON d.category_id = c.id
    WHERE d.id = ?
  `, [id]);

  const doctor = (doctors as any[])[0];

  if (!doctor) {
    return res.status(404).json({
      success: false,
      error: 'Doctor not found',
    });
  }

  res.json({
    success: true,
    data: doctor,
  });
});

// Get doctors by category
export const getDoctorsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params;

  const [doctors] = await pool.query(`
    SELECT d.*, u.first_name, u.last_name, u.email, c.name as categoryName
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    JOIN categories c ON d.category_id = c.id
    WHERE d.category_id = ?
  `, [categoryId]);

  res.json({
    success: true,
    data: doctors,
  });
});

// Create new doctor (Admin only)
export const createDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { 
    first_name, last_name, email, password, 
    category_id, specialization, experience, bio, avatar 
  } = req.body;

  // Start a transaction
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if email already exists
    const [existingUsers] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if ((existingUsers as any[]).length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'Email already in use',
      });
    }

    // Create user first
    const [userResult] = await connection.query(
      'INSERT INTO users (id, first_name, last_name, email, password, role) VALUES (UUID(), ?, ?, ?, ?, ?)',
      [first_name, last_name, email, password, UserRole.DOCTOR]
    );

    // Get the generated user ID
    const [userRows] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    const userId = (userRows as any[])[0].id;

    // Create doctor with the user ID
    const [doctorResult] = await connection.query(
      'INSERT INTO doctors (id, user_id, category_id, specialization, experience, bio, avatar) VALUES (UUID(), ?, ?, ?, ?, ?, ?)',
      [userId, category_id, specialization, experience, bio || null, avatar || null]
    );

    // Get the created doctor with full details
    const [newDoctor] = await connection.query(`
      SELECT d.*, u.first_name, u.last_name, u.email, c.name as categoryName
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN categories c ON d.category_id = c.id
      WHERE u.id = ?
    `, [userId]);

    // Commit transaction
    await connection.commit();

    res.status(201).json({
      success: true,
      data: (newDoctor as any[])[0],
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

// Update doctor
export const updateDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { category_id, specialization, experience, bio, avatar } = req.body;

  // Check if doctor exists
  const [doctors] = await pool.query(
    'SELECT * FROM doctors WHERE id = ?',
    [id]
  );

  if ((doctors as any[]).length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Doctor not found',
    });
  }

  // Update doctor
  await pool.query(
    `UPDATE doctors 
     SET 
        category_id = COALESCE(?, category_id),
        specialization = COALESCE(?, specialization),
        experience = COALESCE(?, experience),
        bio = COALESCE(?, bio),
        avatar = COALESCE(?, avatar)
     WHERE id = ?`,
    [category_id, specialization, experience, bio, avatar, id]
  );

  // Get updated doctor
  const [updatedDoctors] = await pool.query(`
    SELECT d.*, u.first_name, u.last_name, u.email, c.name as categoryName
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    JOIN categories c ON d.category_id = c.id
    WHERE d.id = ?
  `, [id]);

  res.json({
    success: true,
    data: (updatedDoctors as any[])[0],
  });
});

// Delete doctor
export const deleteDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Get doctor to find associated user
  const [doctors] = await pool.query(
    'SELECT user_id FROM doctors WHERE id = ?',
    [id]
  );

  if ((doctors as any[]).length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Doctor not found',
    });
  }

  const userId = (doctors as any[])[0].user_id;

  // Start a transaction
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Delete doctor
    await connection.query('DELETE FROM doctors WHERE id = ?', [id]);
    
    // Delete user
    await connection.query('DELETE FROM users WHERE id = ?', [userId]);

    // Commit transaction
    await connection.commit();

    res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

// Get doctor stats
export const getDoctorStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // First get the doctor_id from users -> doctors mapping
    const [doctors] = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if ((doctors as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    const doctorId = (doctors as any[])[0].id;

    // Get all stats in a single query for better performance
    const [results] = await pool.query(`
      SELECT
        COUNT(*) as totalAppointments,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as pendingAppointments,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as completedAppointments,
        SUM(CASE 
          WHEN date = CURDATE() AND (status = ? OR status = ?)
          THEN 1 ELSE 0 END) as todayAppointments
      FROM appointments
      WHERE doctor_id = ?
    `, [
      AppointmentStatus.PENDING,
      AppointmentStatus.COMPLETED,
      AppointmentStatus.PENDING,
      AppointmentStatus.CONFIRMED,
      doctorId
    ]);

    const stats = (results as any[])[0];

    res.json({
      success: true,
      data: {
        totalAppointments: stats.totalAppointments || 0,
        pendingAppointments: stats.pendingAppointments || 0,
        completedAppointments: stats.completedAppointments || 0,
        todayAppointments: stats.todayAppointments || 0,
      }
    });
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching doctor stats'
    });
  }
};