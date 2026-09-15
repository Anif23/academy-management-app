import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  NotebookPen,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  UsersRound,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Role } from '../utils/rolePermissions';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: Role[];
}

// Kept in sync with the backend's actual permission grants
// (backend/src/constants/roles.js) — a role never sees a nav item it would
// immediately get a 403 from.
export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'STAFF'] },
  { label: 'My Profile', path: '/my-profile', icon: GraduationCap, roles: ['STUDENT'] },
  { label: 'Student Walk-ins', path: '/walk-ins', icon: ClipboardList, roles: ['ADMIN', 'STAFF'] },
  { label: 'Student Registration', path: '/registration', icon: UserPlus, roles: ['ADMIN'] },
  { label: 'Students', path: '/students', icon: GraduationCap, roles: ['ADMIN', 'STAFF'] },
  { label: 'Courses', path: '/courses', icon: BookOpen, roles: ['ADMIN'] },
  { label: 'Admission & Fees', path: '/fees', icon: Wallet, roles: ['ADMIN'] },
  { label: 'Batch Management', path: '/batches', icon: UsersRound, roles: ['ADMIN'] },
  { label: 'Employees / Trainers', path: '/employees', icon: Users, roles: ['ADMIN'] },
  { label: 'Attendance', path: '/attendance', icon: CalendarCheck, roles: ['ADMIN', 'STAFF'] },
  { label: 'Class Reports', path: '/class-reports', icon: NotebookPen, roles: ['ADMIN', 'STAFF'] },
  { label: 'Tasks', path: '/tasks', icon: ListChecks, roles: ['ADMIN', 'STAFF'] },
  { label: 'Student Performance', path: '/performance', icon: GraduationCap, roles: ['ADMIN', 'STAFF'] },
  { label: 'Reports', path: '/reports', icon: FileBarChart, roles: ['ADMIN'] },
  { label: 'User Accounts', path: '/users', icon: ShieldCheck, roles: ['ADMIN'] },
  { label: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] },
  { label: 'Academy Content', path: '/academy-settings', icon: BookOpen, roles: ['ADMIN'] },
];

export function navItemsForRole(role: string | undefined): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role as Role));
}

export function findNavLabel(pathname: string): string {
  const match = NAV_ITEMS.find((item) => pathname.startsWith(item.path));
  return match?.label ?? 'AcademyPro';
}
