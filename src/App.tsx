import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Context providers
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageCategories from './pages/admin/ManageCategories';
import AdminAppointments from './pages/admin/Appointments';

// Doctor pages
import DoctorDashboard from './pages/doctor/Dashboard';
import ManageSchedule from './pages/doctor/ManageSchedule';
import ManageAppointments from './pages/doctor/ManageAppointments';

// Patient pages
import PatientDashboard from './pages/patient/Dashboard';
import DoctorsList from './pages/patient/DoctorsList';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import Profile from './pages/patient/Profile';

// Types
import { UserRole } from './types';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route element={<Layout />}>
              {/* Public routes */}
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />

              {/* Admin routes */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <Outlet />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="doctors" element={<ManageDoctors />} />
                <Route path="categories" element={<ManageCategories />} />
                <Route path="appointments" element={<AdminAppointments />} />
              </Route>

              {/* Doctor routes */}
              <Route
                path="doctor"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.DOCTOR]}>
                    <Outlet />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/doctor/dashboard" replace />} />
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="schedule" element={<ManageSchedule />} />
                <Route path="appointments" element={<ManageAppointments />} />
              </Route>

              {/* Patient routes */}
              <Route
                path="patient"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
                    <Outlet />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/patient/dashboard" replace />} />
                <Route path="dashboard" element={<PatientDashboard />} />
                <Route path="doctors" element={<DoctorsList />} />
                <Route path="book/:doctorId" element={<BookAppointment />} />
                <Route path="appointments" element={<MyAppointments />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;