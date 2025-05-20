import { Request, Response } from 'express';
import pool from '../db/config';

/**
 * @desc    Get all schedules (Admin only)
 * @route   GET /api/schedules
 * @access  Private/Admin
 */
export const getSchedules = async (req: Request, res: Response) => {
  try {
    const [schedules] = await pool.query(`
      SELECT 
        s.*,
        CONCAT(u.first_name, ' ', u.last_name) as doctor_name
      FROM schedules s
      JOIN doctors d ON s.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      ORDER BY s.day ASC
    `);

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching schedules'
    });
  }
};

/**
 * @desc    Get doctor's schedule
 * @route   GET /api/schedules/doctor/:doctorId
 * @access  Public
 */
export const getDoctorSchedule = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;

    // First check if doctor exists
    const [doctors] = await pool.query(
      'SELECT id FROM doctors WHERE id = ?',
      [doctorId]
    );

    if ((doctors as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    const [schedules] = await pool.query(
      'SELECT * FROM schedules WHERE doctor_id = ? ORDER BY day ASC',
      [doctorId]
    );

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching doctor schedule:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching schedule'
    });
  }
};

/**
 * @desc    Get doctor's available slots
 * @route   GET /api/schedules/doctor/:doctorId/available
 * @access  Public
 */
export const getDoctorAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;

    // First check if doctor exists
    const [doctors] = await pool.query(
      'SELECT id FROM doctors WHERE id = ?',
      [doctorId]
    );

    if ((doctors as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    const [schedules] = await pool.query(
      'SELECT * FROM schedules WHERE doctor_id = ? AND is_available = true ORDER BY day ASC',
      [doctorId]
    );

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching available slots'
    });
  }
};

/**
 * @desc    Create a new schedule
 * @route   POST /api/schedules
 * @access  Private/Doctor or Admin
 */
export const createSchedule = async (req: Request, res: Response) => {
  try {
    const { doctor_id, day, start_time, end_time, is_available = true } = req.body;

    // Check if doctor exists
    const [doctors] = await pool.query(
      'SELECT id FROM doctors WHERE id = ?',
      [doctor_id]
    );

    if ((doctors as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    // Check for existing schedule
    const [existingSchedules] = await pool.query(
      'SELECT id FROM schedules WHERE doctor_id = ? AND day = ? AND start_time = ?',
      [doctor_id, day, start_time]
    );

    if ((existingSchedules as any[]).length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Schedule already exists for this time slot'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO schedules (id, doctor_id, day, start_time, end_time, is_available) VALUES (UUID(), ?, ?, ?, ?, ?)',
      [doctor_id, day, start_time, end_time, is_available]
    );

    const [newSchedule] = await pool.query(
      'SELECT * FROM schedules WHERE id = ?',
      [(result as any).insertId]
    );

    res.status(201).json({
      success: true,
      data: (newSchedule as any[])[0]
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error creating schedule'
    });
  }
};

/**
 * @desc    Update a schedule
 * @route   PUT /api/schedules/:id
 * @access  Private/Doctor or Admin
 */
export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_available } = req.body;

    const [result] = await pool.query(
      `UPDATE schedules 
       SET 
        is_available = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [is_available, id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      });
    }

    const [schedules] = await pool.query(
      'SELECT * FROM schedules WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: (schedules as any[])[0]
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error updating schedule'
    });
  }
};

/**
 * @desc    Delete a schedule
 * @route   DELETE /api/schedules/:id
 * @access  Private/Doctor or Admin
 */
export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM schedules WHERE id = ?', [id]);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error deleting schedule'
    });
  }
};