import type { ReactNode } from 'react';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="animate-pulse divide-y divide-border">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 px-5 py-4">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <div key={colIndex} className="h-3.5 flex-1 rounded bg-surface-hover" style={{ maxWidth: colIndex === 0 ? '20%' : undefined }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-surface p-5">
      <div className="h-3 w-1/3 rounded bg-surface-hover" />
      <div className="mt-3 h-7 w-1/2 rounded bg-surface-hover" />
      <div className="mt-4 h-2.5 w-2/3 rounded bg-surface-hover" />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-hover text-text-muted">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10">
        <AlertCircle className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-text-primary">Something went wrong</p>
        <p className="mt-1 max-w-sm text-sm text-text-muted">{message ?? 'We could not load this data. Please try again.'}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}
