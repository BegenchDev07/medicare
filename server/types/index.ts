// User related types
export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithoutPassword {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Auth related types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UserAuth {
  id: number;
  email: string;
  role: UserRole;
  token: string;
}

// Doctor related types
export interface Doctor {
  id: number;
  userId: number;
  categoryId: number;
  specialization: string;
  experience: number;
  bio: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorWithDetails extends Doctor {
  firstName: string;
  lastName: string;
  email: string;
  categoryName: string;
}

export interface CreateDoctorData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  categoryId: number;
  specialization: string;
  experience: number;
  bio: string;
  avatar?: string;
}

export interface UpdateDoctorData {
  categoryId?: number;
  specialization?: string;
  experience?: number;
  bio?: string;
  avatar?: string;
}

// Category related types
export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryData {
  name: string;
  description: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
}

// Appointment related types
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Appointment {
  id: number;
  doctorId: number;
  patientId: number;
  date: Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentWithDetails extends Appointment {
  doctorName: string;
  patientName: string;
  category: string;
}

export interface CreateAppointmentData {
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface UpdateAppointmentData {
  status?: AppointmentStatus;
  notes?: string;
}

// Schedule related types
export interface Schedule {
  id: number;
  doctorId: number;
  day: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateScheduleData {
  doctorId: number;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
}

export interface UpdateScheduleData {
  isAvailable?: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface DaySchedule {
  date: string;
  slots: TimeSlot[];
}

// API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}