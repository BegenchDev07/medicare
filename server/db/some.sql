USE hospital_management;
-- Create enum-like tables for status
CREATE TABLE IF NOT EXISTS appointment_status (
  id VARCHAR(20) PRIMARY KEY,
  description VARCHAR(100)
);

-- Insert status values
INSERT INTO appointment_status (id, description) VALUES
  ('pending', 'Appointment is waiting for confirmation'),
  ('confirmed', 'Appointment has been confirmed'),
  ('completed', 'Appointment has been completed'),
  ('cancelled', 'Appointment has been cancelled');

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
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (status) REFERENCES appointment_status(id),
  UNIQUE KEY unique_doctor_appointment (doctor_id, date, start_time)
);

-- Create trigger to update schedule availability when appointment is created
DELIMITER //
CREATE TRIGGER after_appointment_insert
AFTER INSERT ON appointments
FOR EACH ROW
BEGIN
  UPDATE schedules 
  SET is_available = FALSE
  WHERE doctor_id = NEW.doctor_id 
    AND day = NEW.date 
    AND start_time = NEW.start_time;
END//

-- Create trigger to update schedule availability when appointment is cancelled
CREATE TRIGGER after_appointment_update
AFTER UPDATE ON appointments
FOR EACH ROW
BEGIN
  IF NEW.status = 'cancelled' THEN
    UPDATE schedules 
    SET is_available = TRUE
    WHERE doctor_id = NEW.doctor_id 
      AND day = NEW.date 
      AND start_time = NEW.start_time;
  END IF;
END//
DELIMITER ;