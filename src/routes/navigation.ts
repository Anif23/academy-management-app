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
  UserPlus,
  Users,
  UsersRound,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Student Walk-ins', path: '/walk-ins', icon: ClipboardList },
  { label: 'Student Registration', path: '/registration', icon: UserPlus },
  { label: 'Students', path: '/students', icon: GraduationCap },
  { label: 'Admission & Fees', path: '/fees', icon: Wallet },
  { label: 'Employees / Trainers', path: '/employees', icon: Users },
  { label: 'Courses', path: '/courses', icon: BookOpen },
  { label: 'Batch Management', path: '/batches', icon: UsersRound },
  { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { label: 'Class Reports', path: '/class-reports', icon: NotebookPen },
  { label: 'Tasks', path: '/tasks', icon: ListChecks },
  { label: 'Student Performance', path: '/performance', icon: GraduationCap },
  { label: 'Reports', path: '/reports', icon: FileBarChart },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function findNavLabel(pathname: string): string {
  const match = NAV_ITEMS.find((item) => pathname.startsWith(item.path));
  return match?.label ?? 'Acadmey';
}
