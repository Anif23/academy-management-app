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
import { hasPermission } from '../utils/rolePermissions';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  /** Shown when the user has ANY of these permissions (mirrors the backend route guard). */
  permissions: string[];
}

export interface NavGroup {
  label: string | null; // null = ungrouped, always-visible top-level items
  items: NavItem[];
}

// Kept in sync with the backend's actual permission grants
// (backend/src/constants/roles.js) — a role never sees a nav item it would
// immediately get a 403 from. Grouped so a long admin/staff menu reads as
// a few labeled sections instead of one long flat list; each group is
// collapsible in the sidebar and the group containing the active page
// auto-expands.
export const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permissions: ['dashboard:read'] },
      { label: 'My Profile', path: '/my-profile', icon: GraduationCap, permissions: ['profile:read-own'] },
      { label: 'My Tasks', path: '/my-tasks', icon: ListChecks, permissions: ['tasks:read-own'] },
    ],
  },
  {
    label: 'Admissions',
    items: [
      { label: 'Student Walk-ins', path: '/walk-ins', icon: ClipboardList, permissions: ['walkins:read'] },
      { label: 'Student Registration', path: '/registration', icon: UserPlus, permissions: ['walkins:create', 'students:create'] },
      { label: 'Admission & Fees', path: '/fees', icon: Wallet, permissions: ['fees:read'] },
    ],
  },
  {
    label: 'Academics',
    items: [
      { label: 'Students', path: '/students', icon: GraduationCap, permissions: ['students:read'] },
      { label: 'Courses', path: '/courses', icon: BookOpen, permissions: ['courses:read'] },
      { label: 'Batch Management', path: '/batches', icon: UsersRound, permissions: ['batches:read'] },
      { label: 'Attendance', path: '/attendance', icon: CalendarCheck, permissions: ['attendance:read'] },
      { label: 'Class Reports', path: '/class-reports', icon: NotebookPen, permissions: ['classreports:read'] },
      { label: 'Tasks', path: '/tasks', icon: ListChecks, permissions: ['tasks:read'] },
      { label: 'Student Performance', path: '/performance', icon: GraduationCap, permissions: ['performance:read'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Employees / Trainers', path: '/employees', icon: Users, permissions: ['staff:read'] },
      { label: 'Reports', path: '/reports', icon: FileBarChart, permissions: ['reports:read'] },
      { label: 'User Accounts', path: '/users', icon: ShieldCheck, permissions: ['users:read'] },
      { label: 'Roles & Permissions', path: '/roles-permissions', icon: ShieldCheck, permissions: ['permissions:manage'] },
      { label: 'Academy Content', path: '/academy-settings', icon: BookOpen, permissions: ['academy:manage', 'branding:manage', 'testimonials:manage', 'faqs:manage', 'announcements:manage'] },
      { label: 'Settings', path: '/settings', icon: Settings, permissions: ['branding:manage', 'academy:manage'] },
    ],
  },
];

// Flat list, derived from the groups above — kept for any code that just
// needs "all nav items" without caring about grouping (e.g. findNavLabel).
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function navGroupsForPermissions(permissions: string[] | undefined): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => hasPermission(permissions, item.permissions)),
  })).filter((group) => group.items.length > 0);
}

export function findNavLabel(pathname: string): string {
  const match = NAV_ITEMS.find((item) => pathname.startsWith(item.path));
  return match?.label ?? 'AcademyPro';
}
