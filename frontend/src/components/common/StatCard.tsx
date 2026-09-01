import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; direction: 'up' | 'down' };
  tone?: 'brand' | 'green' | 'amber' | 'purple';
}

const toneClasses = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
};

export function StatCard({ label, value, icon: Icon, trend, tone = 'brand' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">{value}</p>
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium">
          {trend.direction === 'up' ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
          )}
          <span className={trend.direction === 'up' ? 'text-emerald-600' : 'text-red-500'}>{trend.value}</span>
          <span className="text-text-muted">vs last month</span>
        </div>
      )}
    </div>
  );
}
