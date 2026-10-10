import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type BadgeTone = 'slate' | 'green' | 'red' | 'amber' | 'blue' | 'purple' | 'brand';

const toneClasses: Record<BadgeTone, string> = {
  slate: 'bg-surface-hover text-text-secondary',
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  red: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  purple: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
};

export function Badge({ children, tone = 'slate', className }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONE_MAP: Record<string, BadgeTone> = {
  Active: 'green',
  Ongoing: 'green',
  Completed: 'blue',
  Admission: 'green',
  Present: 'green',
  Interested: 'blue',
  Counselling: 'purple',
  Contacted: 'amber',
  New: 'slate',
  'Not Interested': 'red',
  Dropped: 'red',
  Absent: 'red',
  'On Hold': 'amber',
  Inactive: 'red',
  Upcoming: 'purple',
  Leave: 'amber',
  Pending: 'amber',
  Submitted: 'blue',
  'Needs Revision': 'red',
  Resubmitted: 'purple',
  Overdue: 'red',
  'In Progress': 'blue',
  High: 'red',
  Medium: 'amber',
  Low: 'slate',
  Given: 'blue',
  Reviewed: 'green',
  'Not Given': 'slate',
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE_MAP[status] ?? 'slate'}>{status}</Badge>;
}
