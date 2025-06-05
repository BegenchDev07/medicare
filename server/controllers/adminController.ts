import { Request, Response } from 'express';
import pool from '../db/config';
import { AppointmentStatus } from '../types';

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Get all stats in a single query for better performance
      const [results] = await connection.query(`
        SELECT
          (SELECT COUNT(*) FROM users WHERE role = 'patient') as totalPatients,
          (SELECT COUNT(*) FROM doctors) as totalDoctors,
          (SELECT COUNT(*) FROM appointments) as totalAppointments,
          (SELECT COUNT(*) FROM appointments WHERE status = ?) as pendingAppointments,
          (SELECT COUNT(*) FROM appointments WHERE status = ?) as completedAppointments,
          (SELECT COUNT(*) 
           FROM appointments 
           WHERE DATE(date) = CURDATE() AND (status = ? OR status = ?)) as todayAppointments
      `, [
        AppointmentStatus.PENDING,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.PENDING,
        AppointmentStatus.CONFIRMED
      ]);

      const stats = (results as any[])[0];

      res.json({
        success: true,
        data: {
          totalPatients: stats.totalPatients || 0,
          totalDoctors: stats.totalDoctors || 0,
          totalAppointments: stats.totalAppointments || 0,
          pendingAppointments: stats.pendingAppointments || 0,
          completedAppointments: stats.completedAppointments || 0,
          todayAppointments: stats.todayAppointments || 0,
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching admin stats'
    });
  }
};