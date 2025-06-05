# Hospital Management System Documentation

## Overview

A comprehensive hospital management system built with React, TypeScript, and Node.js, featuring role-based access control, appointment scheduling, and doctor management.

## Tech Stack

### Frontend
- React 18.3.1 with TypeScript
- Vite for bundling
- Tailwind CSS for styling
- React Router v6 for routing
- Lucide React for icons
- React Hook Form for form management
- Date-fns for date manipulation

### Backend
- Node.js with Express
- MySQL database
- JWT for authentication
- Bcrypt for password hashing
- Joi for validation

## Architecture

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'doctor', 'patient') NOT NULL DEFAULT 'patient',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Doctors Table
```sql
CREATE TABLE doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  categoryId INT NOT NULL,
  specialization VARCHAR(255) NOT NULL,
  experience INT NOT NULL DEFAULT 0,
  bio TEXT,
  avatar VARCHAR(255),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (categoryId) REFERENCES categories(id)
);
```

#### Categories Table
```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);
```

#### Appointments Table
```sql
CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctorId INT NOT NULL,
  patientId INT NOT NULL,
  date DATE NOT NULL,
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  FOREIGN KEY (doctorId) REFERENCES doctors(id),
  FOREIGN KEY (patientId) REFERENCES users(id)
);
```

#### Schedules Table
```sql
CREATE TABLE schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctorId INT NOT NULL,
  day DATE NOT NULL,
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  isAvailable BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (doctorId) REFERENCES doctors(id)
);
```

### API Endpoints

#### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration

#### Users
- GET `/api/users` - Get all users (Admin)
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

#### Doctors
- GET `/api/doctors` - List all doctors
- GET `/api/doctors/:id` - Get doctor details
- GET `/api/doctors/category/:categoryId` - Get doctors by category
- POST `/api/doctors` - Create doctor (Admin)
- PUT `/api/doctors/:id` - Update doctor
- DELETE `/api/doctors/:id` - Delete doctor

#### Categories
- GET `/api/categories` - List all categories
- POST `/api/categories` - Create category (Admin)
- PUT `/api/categories/:id` - Update category (Admin)
- DELETE `/api/categories/:id` - Delete category (Admin)

#### Appointments
- GET `/api/appointments` - List all appointments (Admin)
- GET `/api/appointments/doctor` - Doctor's appointments
- GET `/api/appointments/patient` - Patient's appointments
- POST `/api/appointments` - Create appointment
- PUT `/api/appointments/:id` - Update appointment status
- DELETE `/api/appointments/:id` - Cancel appointment

#### Schedules
- GET `/api/schedules/doctor/:doctorId` - Get doctor's schedule
- GET `/api/schedules/doctor/:doctorId/available` - Get available slots
- POST `/api/schedules` - Create schedule
- PUT `/api/schedules/:id` - Update schedule
- DELETE `/api/schedules/:id` - Delete schedule

### Frontend Structure

#### Components
- Common
  - Alert - Display notifications
  - Button - Reusable button component
  - Card - Container component
  - FormField - Form input fields
  - ProtectedRoute - Route access control

- Layout
  - Navbar - Main navigation
  - Footer - Site footer
  - Layout - Page wrapper

#### Pages
- Admin
  - Dashboard - Admin overview
  - ManageDoctors - Doctor management
  - ManageCategories - Category management

- Doctor
  - Dashboard - Doctor overview
  - ManageSchedule - Schedule management
  - ManageAppointments - Appointment management

- Patient
  - Dashboard - Patient overview
  - DoctorsList - Browse doctors
  - BookAppointment - Schedule appointments
  - MyAppointments - View appointments

### State Management

Uses React Context for:
- Authentication state (AuthContext)
- User information
- Token management

### Role-Based Access Control (RBAC)

Three user roles:
1. Admin
   - Full system access
   - Manage doctors/categories
   - View all appointments

2. Doctor
   - Manage own schedule
   - View/update appointments
   - Update profile

3. Patient
   - Book appointments
   - View own appointments
   - Cancel appointments

### Security

- JWT for authentication
- Password hashing with bcrypt
- Route protection with middleware
- Input validation with Joi
- CORS configuration
- Environment variables for sensitive data

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=hospital_management
JWT_SECRET=your_secret_key
```

3. Start development server:
```bash
npm run dev:full
```

## Production Deployment

1. Build frontend:
```bash
npm run build
```

2. Start production server:
```bash
npm run server
```

## Project Structure

```
├── docs/
│   └── README.md
├── server/
│   ├── controllers/
│   ├── db/
│   ├── middleware/
│   ├── routes/
│   ├── types/
│   └── utils/
├── src/
│   ├── components/
│   ├── contexts/
│   ├── pages/
│   ├── types/
│   └── utils/
├── supabase/
│   └── migrations/
└── package.json
```