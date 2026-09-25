import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentClasses from './pages/student/StudentClasses';
import StudentProfile from './pages/student/StudentProfile';
import FaceRegistration from './pages/student/FaceRegistration';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherClasses from './pages/teacher/TeacherClasses';
import CreateClassroom from './pages/teacher/CreateClassroom';
import TakeAttendance from './pages/teacher/TakeAttendance';
import AttendanceResult from './pages/teacher/AttendanceResult';
import TeacherReports from './pages/teacher/TeacherReports';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageClassrooms from './pages/admin/ManageClassrooms';
import ManageSubjects from './pages/admin/ManageSubjects';
import AdminReports from './pages/admin/AdminReports';

import './App.css';

// Root redirect handler based on current user role
const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="classes" element={<StudentClasses />} />
            <Route path="face-registration" element={<FaceRegistration />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="classes" element={<TeacherClasses />} />
            <Route path="create-classroom" element={<CreateClassroom />} />
            <Route path="take-attendance" element={<TakeAttendance />} />
            <Route path="attendance-result" element={<AttendanceResult />} />
            <Route path="reports" element={<TeacherReports />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="teachers" element={<ManageTeachers />} />
            <Route path="classrooms" element={<ManageClassrooms />} />
            <Route path="subjects" element={<ManageSubjects />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;