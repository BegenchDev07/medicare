// User related types
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
}

export interface UserAuth {
  id: string;
  email: string;
  role: UserRole;
  token: string;
}

// Doctor related types
export interface Doctor {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  category_id: string;
  categoryName?: string;
  specialization: string;
  experience: number;
  bio: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

// Category related types
export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Appointment related types
export interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  doctorName?: string;
  patientName?: string;
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Appointment slot types
export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface DaySchedule {
  date: string;
  slots: TimeSlot[];
}

// Auth context types
export interface AuthContextType {
  user: UserAuth | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role?: UserRole;
}