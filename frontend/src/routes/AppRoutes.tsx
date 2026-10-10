import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PermissionRoute } from './PermissionRoute';
import { GuestRoute } from './GuestRoute';
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
import TaskReview from '../pages/TaskReview';
import RolesPermissions from '../pages/RolesPermissions';
import MyTasks from '../pages/MyTasks';
import TaskSubmit from '../pages/TaskSubmit';
import Performance from '../pages/Performance';
import Reports from '../pages/Reports';
import Profile from '../pages/Profile';
import ChangePassword from '../pages/ChangePassword';
import Settings from '../pages/Settings';
import AcademySettings from '../pages/AcademySettings';
import Users from '../pages/Users';
import NotFound from '../pages/NotFound';

function HomeRedirect() {
  const user = useAuthStore((s) => s.user);
  return <Navigate to={homeRouteForRole(user?.role, user?.permissions)} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

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
            <PermissionRoute anyOf={['dashboard:read']}>
              <Dashboard />
            </PermissionRoute>
          }
        />
        <Route
          path="/my-profile"
          element={
            <PermissionRoute anyOf={['profile:read-own']}>
              <MyProfile />
            </PermissionRoute>
          }
        />
        <Route
          path="/walk-ins"
          element={
            <PermissionRoute anyOf={['walkins:read']}>
              <WalkIns />
            </PermissionRoute>
          }
        />
        <Route
          path="/registration"
          element={
            <PermissionRoute anyOf={['walkins:create', 'students:create']}>
              <Registration />
            </PermissionRoute>
          }
        />
        <Route
          path="/students"
          element={
            <PermissionRoute anyOf={['students:read']}>
              <Students />
            </PermissionRoute>
          }
        />
        <Route
          path="/students/:studentId"
          element={
            <PermissionRoute anyOf={['students:read']}>
              <StudentProfile />
            </PermissionRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <PermissionRoute anyOf={['courses:read']}>
              <Courses />
            </PermissionRoute>
          }
        />
        <Route
          path="/fees"
          element={
            <PermissionRoute anyOf={['fees:read']}>
              <Fees />
            </PermissionRoute>
          }
        />
        <Route
          path="/batches"
          element={
            <PermissionRoute anyOf={['batches:read']}>
              <Batches />
            </PermissionRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <PermissionRoute anyOf={['staff:read']}>
              <Employees />
            </PermissionRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <PermissionRoute anyOf={['attendance:read']}>
              <Attendance />
            </PermissionRoute>
          }
        />
        <Route
          path="/class-reports"
          element={
            <PermissionRoute anyOf={['classreports:read']}>
              <ClassReports />
            </PermissionRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <PermissionRoute anyOf={['tasks:read']}>
              <Tasks />
            </PermissionRoute>
          }
        />
        <Route
          path="/tasks/:id/review"
          element={
            <PermissionRoute anyOf={['tasks:read']}>
              <TaskReview />
            </PermissionRoute>
          }
        />
        <Route
          path="/my-tasks"
          element={
            <PermissionRoute anyOf={['tasks:read-own']}>
              <MyTasks />
            </PermissionRoute>
          }
        />
        <Route
          path="/my-tasks/:taskId"
          element={
            <PermissionRoute anyOf={['tasks:read-own']}>
              <TaskSubmit />
            </PermissionRoute>
          }
        />
        <Route
          path="/performance"
          element={
            <PermissionRoute anyOf={['performance:read']}>
              <Performance />
            </PermissionRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PermissionRoute anyOf={['reports:read']}>
              <Reports />
            </PermissionRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PermissionRoute anyOf={['users:read']}>
              <Users />
            </PermissionRoute>
          }
        />
        <Route
          path="/roles-permissions"
          element={
            <PermissionRoute anyOf={['permissions:manage']}>
              <RolesPermissions />
            </PermissionRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PermissionRoute anyOf={['branding:manage', 'academy:manage']}>
              <Settings />
            </PermissionRoute>
          }
        />
        <Route
          path="/academy-settings"
          element={
            <PermissionRoute anyOf={['academy:manage', 'branding:manage', 'testimonials:manage', 'faqs:manage', 'announcements:manage']}>
              <AcademySettings />
            </PermissionRoute>
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Route>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
