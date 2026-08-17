import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import WalkIns from '../pages/WalkIns';
import Registration from '../pages/Registration';
import Students from '../pages/Students';
import StudentProfile from '../pages/StudentProfile';
import Courses from '../pages/Courses';
import Fees from '../pages/Fees';
import Batches from '../pages/Batches';
import Employees from '../pages/Employees';
import Attendance from '../pages/Attendance';
import ClassReports from '../pages/ClassReports';
import Tasks from '../pages/Tasks';
import Performance from '../pages/Performance';
import Reports from '../pages/Reports';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/walk-ins" element={<WalkIns />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/students" element={<Students />} />
        <Route path="/students/:studentId" element={<StudentProfile />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/fees" element={<Fees />} />
        <Route path="/batches" element={<Batches />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/class-reports" element={<ClassReports />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
