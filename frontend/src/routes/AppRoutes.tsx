import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { useAuthStore } from '../store/authStore';
import { homeRouteForRole } from '../utils/rolePermissions';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import WalkIns from '../pages/WalkIns';
import Registration from '../pages/Registration';
import Students from '../pages/Students';
import StudentProfile from '../pages/StudentProfile';
import MyProfile from '../pages/MyProfile';
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
import AcademySettings from '../pages/AcademySettings';
import Users from '../pages/Users';
import NotFound from '../pages/NotFound';

function HomeRedirect() {
  const role = useAuthStore((s) => s.user?.role);
  return <Navigate to={homeRouteForRole(role)} replace />;
}

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
        <Route
          path="/dashboard"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'STAFF']}>
              <Dashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/my-profile"
          element={
            <RoleRoute allowedRoles={['STUDENT']}>
              <MyProfile />
            </RoleRoute>
          }
        />
        <Route
          path="/walk-ins"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'STAFF']}>
              <WalkIns />
            </RoleRoute>
          }
        />
        <Route
          path="/registration"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <Registration />
            </RoleRoute>
          }
        />
        <Route
          path="/students"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'STAFF']}>
              <Students />
            </RoleRoute>
          }
        />
        <Route
          path="/students/:studentId"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'STAFF']}>
              <StudentProfile />
            </RoleRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <Courses />
            </RoleRoute>
          }
        />
        <Route
          path="/fees"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <Fees />
            </RoleRoute>
          }
        />
        <Route
          path="/batches"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <Batches />
            </RoleRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <Employees />
            </RoleRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'STAFF']}>
              <Attendance />
            </RoleRoute>
          }
        />
        <Route
          path="/class-reports"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'STAFF']}>
              <ClassReports />
            </RoleRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'STAFF']}>
              <Tasks />
            </RoleRoute>
          }
        />
        <Route
          path="/performance"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'STAFF']}>
              <Performance />
            </RoleRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <Reports />
            </RoleRoute>
          }
        />
        <Route
          path="/users"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <Users />
            </RoleRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <Settings />
            </RoleRoute>
          }
        />
        <Route
          path="/academy-settings"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <AcademySettings />
            </RoleRoute>
          }
        />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
