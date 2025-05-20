import { Request, Response } from 'express';
import pool from '../db/config';
import { AppointmentStatus } from '../types';

export const getPatientStats = async (req: Request, res: Response) => {
  try {
    const patientId = req.user!.id;

    // Get all stats in a single query for better performance
    const [results] = await pool.query(`
      SELECT
        COUNT(*) as totalAppointments,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as pendingAppointments,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as completedAppointments,
        SUM(CASE 
          WHEN status = ? AND date >= CURDATE() 
          THEN 1 ELSE 0 END) as upcomingAppointments
      FROM appointments
      WHERE patient_id = ?
    `, [
      AppointmentStatus.PENDING,
      AppointmentStatus.COMPLETED,
      AppointmentStatus.CONFIRMED,
      patientId
    ]);

    const stats = (results as any[])[0];

    res.json({
      success: true,
      data: {
        totalAppointments: stats.totalAppointments || 0,
        pendingAppointments: stats.pendingAppointments || 0,
        completedAppointments: stats.completedAppointments || 0,
        upcomingAppointments: stats.upcomingAppointments || 0,
      }
    });
  } catch (error) {
    console.error('Error fetching patient stats:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching patient stats'
    });
  }
};