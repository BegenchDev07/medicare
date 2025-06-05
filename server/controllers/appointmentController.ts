import { Request, Response } from 'express';
import pool from '../db/config';
import { AppointmentStatus } from '../types';

/**
 * @desc    Get all appointments (Admin only)
 * @route   GET /api/appointments
 * @access  Private/Admin
 */
export const getAppointments = async (req: Request, res: Response) => {
  try {
    const [appointments] = await pool.query(`
      SELECT 
        a.*,
        CONCAT(d_user.first_name, ' ', d_user.last_name) as doctor_name,
        CONCAT(p_user.first_name, ' ', p_user.last_name) as patient_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users d_user ON d.user_id = d_user.id
      JOIN users p_user ON a.patient_id = p_user.id
      ORDER BY a.date ASC, a.start_time ASC
    `);

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching appointments'
    });
  }
};

/**
 * @desc    Get appointments for logged-in doctor
 * @route   GET /api/appointments/doctor
 * @access  Private/Doctor
 */
export const getDoctorAppointments = async (req: Request, res: Response) => {
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

    const [appointments] = await pool.query(`
      SELECT 
        a.*,
        CONCAT(p_user.first_name, ' ', p_user.last_name) as patient_name
      FROM appointments a
      JOIN users p_user ON a.patient_id = p_user.id
      WHERE a.doctor_id = ?
      ORDER BY a.date ASC, a.start_time ASC
    `, [doctorId]);

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching appointments'
    });
  }
};

/**
 * @desc    Get appointments for a specific doctor
 * @route   GET /api/appointments/doctor/:doctorId
 * @access  Public
 */
export const getDoctorAppointmentsByDoctorId = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;

    const [appointments] = await pool.query(`
      SELECT 
        a.*,
        CONCAT(p_user.first_name, ' ', p_user.last_name) as patient_name
      FROM appointments a
      JOIN users p_user ON a.patient_id = p_user.id
      WHERE a.doctor_id = ?
      ORDER BY a.date ASC, a.start_time ASC
    `, [doctorId]);

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching appointments'
    });
  }
};

/**
 * @desc    Get appointments for logged-in patient
 * @route   GET /api/appointments/patient
 * @access  Private
 */
export const getPatientAppointments = async (req: Request, res: Response) => {
  try {
    const patientId = req.user!.id;
    const [appointments] = await pool.query(`
      SELECT 
        a.*,
        CONCAT(d_user.first_name, ' ', d_user.last_name) as doctor_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users d_user ON d.user_id = d_user.id
      WHERE a.patient_id = ?
      ORDER BY a.date ASC, a.start_time ASC
    `, [patientId]);

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching appointments'
    });
  }
};

/**
 * @desc    Create a new appointment
 * @route   POST /api/appointments
 * @access  Private
 */
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { doctor_id, date, start_time, end_time, notes } = req.body;
    const patient_id = req.user!.id;

    // Check if the time slot is available
    const [existingAppointments] = await pool.query(
      'SELECT id FROM appointments WHERE doctor_id = ? AND date = ? AND start_time = ? AND status != ?',
      [doctor_id, date, start_time, AppointmentStatus.CANCELLED]
    );

    if ((existingAppointments as any[]).length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Time slot is not available'
      });
    }

    // Create appointment
    const [result] = await pool.query(
      'INSERT INTO appointments (id, doctor_id, patient_id, date, start_time, end_time, notes, status) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)',
      [doctor_id, patient_id, date, start_time, end_time, notes, AppointmentStatus.PENDING]
    );

    const [newAppointment] = await pool.query(
      'SELECT * FROM appointments WHERE id = ?',
      [(result as any).insertId]
    );

    res.status(201).json({
      success: true,
      data: (newAppointment as any[])[0]
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error creating appointment'
    });
  }
};

/**
 * @desc    Update appointment status
 * @route   PUT /api/appointments/:id
 * @access  Private
 */
export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const [result] = await pool.query(
      `UPDATE appointments 
       SET 
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, notes, id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    const [appointments] = await pool.query(
      'SELECT * FROM appointments WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: (appointments as any[])[0]
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error updating appointment'
    });
  }
};

/**
 * @desc    Update appointment status to cancelled
 * @route   DELETE /api/appointments/:id
 * @access  Private
 */
export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [AppointmentStatus.CANCELLED, id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    const [appointments] = await pool.query(
      'SELECT * FROM appointments WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: (appointments as any[])[0]
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error cancelling appointment'
    });
  }
};