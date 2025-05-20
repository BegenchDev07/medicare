// API URL - Ensure valid URL construction
export const API_URL = import.meta.env.DEV 
  ? 'http://localhost:3003/api' 
  : `${window.location.origin}/api`;

// Time slots for appointments (30-minute intervals from 9 AM to 5 PM)
export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00'
];

// Maximum appointments per day
export const MAX_APPOINTMENTS_PER_DAY = 10;

// Navigation items
export const ADMIN_NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Manage Doctors', path: '/admin/doctors' },
  { name: 'Manage Categories', path: '/admin/categories' },
];

export const DOCTOR_NAV_ITEMS = [
  { name: 'Dashboard', path: '/doctor/dashboard' },
  { name: 'My Schedule', path: '/doctor/schedule' },
  { name: 'Appointments', path: '/doctor/appointments' },
];

export const PATIENT_NAV_ITEMS = [
  { name: 'Dashboard', path: '/patient/dashboard' },
  { name: 'Find Doctors', path: '/patient/doctors' },
  { name: 'My Appointments', path: '/patient/appointments' },
  { name: 'My Profile', path: '/patient/profile' },
];