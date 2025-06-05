import Joi from 'joi';
import { UserRole, AppointmentStatus } from '../types';

// User validation schemas
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const registerSchema = Joi.object({
  first_name: Joi.string().min(2).max(100).required(),
  last_name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid(...Object.values(UserRole)).default(UserRole.PATIENT),
});

export const updateUserSchema = Joi.object({
  first_name: Joi.string().min(2).max(100),
  last_name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
}).min(1);

// Doctor validation schemas
export const createDoctorSchema = Joi.object({
  first_name: Joi.string().min(2).max(100).required(),
  last_name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  category_id: Joi.string().required(),
  specialization: Joi.string().required(),
  experience: Joi.number().integer().min(0).required(),
  bio: Joi.string().max(500).allow(''),
  avatar: Joi.string().uri().allow(''),
});

export const updateDoctorSchema = Joi.object({
  first_name: Joi.string().min(2).max(100),
  last_name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  category_id: Joi.string(),
  specialization: Joi.string(),
  experience: Joi.number().integer().min(0),
  bio: Joi.string().max(500).allow(''),
  avatar: Joi.string().uri().allow(''),
}).min(1);

// Category validation schemas
export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow(''),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().allow(''),
}).min(1);

export const createAppointmentSchema = Joi.object({
  doctor_id: Joi.string().required(),
  date: Joi.date().iso().required(),
  start_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
  end_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
  notes: Joi.string().allow(''),
});

export const updateAppointmentSchema = Joi.object({
  status: Joi.string().valid(...Object.values(AppointmentStatus)),
  notes: Joi.string().allow(''),
}).min(1);

// Schedule validation schemas
export const createScheduleSchema = Joi.object({
  doctor_id: Joi.string().required(),
  day: Joi.date().iso().required(),
  start_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
  end_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
  is_available: Joi.boolean().default(true),
});

export const updateScheduleSchema = Joi.object({
  is_available: Joi.boolean().required(),
});