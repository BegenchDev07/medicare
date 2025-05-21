/*
  # Initial Database Schema with Test Data

  1. Schema
    - Creates all necessary tables
    - Sets up foreign key relationships
    - Enables row level security

  2. Test Data
    - Admin account
    - Doctor accounts
    - Patient accounts
    - Categories
    - Sample appointments
*/

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS hospital_management;
USE hospital_management;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'doctor', 'patient') NOT NULL DEFAULT 'patient',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  category_id VARCHAR(36) NOT NULL,
  specialization VARCHAR(255) NOT NULL,
  experience INT NOT NULL DEFAULT 0,
  bio TEXT,
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id VARCHAR(36) PRIMARY KEY,
  doctor_id VARCHAR(36) NOT NULL,
  day DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  UNIQUE KEY unique_doctor_schedule (doctor_id, day, start_time)
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(36) PRIMARY KEY,
  doctor_id VARCHAR(36) NOT NULL,
  patient_id VARCHAR(36) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_doctor_appointment (doctor_id, date, start_time)
);

-- Insert test data

-- Admin user
INSERT INTO users (id, first_name, last_name, email, password, role) VALUES
('admin-1', 'Admin', 'User', 'admin@example.com', 'admin123', 'admin');

-- Categories
INSERT INTO categories (id, name, description) VALUES
('cat-1', 'Cardiology', 'Heart and cardiovascular system specialists'),
('cat-2', 'Dermatology', 'Skin, hair, and nail specialists'),
('cat-3', 'Pediatrics', 'Child healthcare specialists'),
('cat-4', 'Orthopedics', 'Bone and joint specialists');

-- Doctor users
INSERT INTO users (id, first_name, last_name, email, password, role) VALUES
('doc-1', 'John', 'Smith', 'john.smith@example.com', 'doctor123', 'doctor'),
('doc-2', 'Sarah', 'Johnson', 'sarah.johnson@example.com', 'doctor123', 'doctor'),
('doc-3', 'Michael', 'Brown', 'michael.brown@example.com', 'doctor123', 'doctor');

-- Doctors
INSERT INTO doctors (id, user_id, category_id, specialization, experience, bio) VALUES
('dr-1', 'doc-1', 'cat-1', 'Cardiologist', 10, 'Experienced cardiologist specializing in heart diseases'),
('dr-2', 'doc-2', 'cat-2', 'Dermatologist', 8, 'Skin care specialist with expertise in cosmetic dermatology'),
('dr-3', 'doc-3', 'cat-3', 'Pediatrician', 12, 'Child healthcare expert with focus on developmental disorders');

-- Patient users
INSERT INTO users (id, first_name, last_name, email, password, role) VALUES
('pat-1', 'Alice', 'Wilson', 'alice@example.com', 'patient123', 'patient'),
('pat-2', 'Bob', 'Taylor', 'bob@example.com', 'patient123', 'patient'),
('pat-3', 'Carol', 'Martinez', 'carol@example.com', 'patient123', 'patient');

-- Sample appointments
INSERT INTO appointments (id, doctor_id, patient_id, date, start_time, end_time, status, notes) VALUES
('apt-1', 'dr-1', 'pat-1', CURDATE(), '09:00', '09:30', 'confirmed', 'Regular checkup'),
('apt-2', 'dr-2', 'pat-2', CURDATE(), '10:00', '10:30', 'pending', 'Skin consultation'),
('apt-3', 'dr-3', 'pat-3', CURDATE(), '11:00', '11:30', 'completed', 'Follow-up visit');

-- Sample schedules
INSERT INTO schedules (id, doctor_id, day, start_time, end_time) VALUES
('sch-1', 'dr-1', CURDATE(), '09:00', '17:00'),
('sch-2', 'dr-2', CURDATE(), '09:00', '17:00'),
('sch-3', 'dr-3', CURDATE(), '09:00', '17:00');