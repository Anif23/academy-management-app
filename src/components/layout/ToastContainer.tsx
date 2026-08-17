import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';
import { cn } from '../../utils/cn';

const VARIANT_STYLES = {
  success: { icon: CheckCircle2, className: 'text-emerald-600' },
  error: { icon: AlertCircle, className: 'text-red-600' },
  info: { icon: Info, className: 'text-brand-600' },
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toastItem) => {
        const { icon: Icon, className } = VARIANT_STYLES[toastItem.variant];
        return (
          <div
            key={toastItem.id}
            role="status"
            className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 shadow-popover animate-slide-up"
          >
            <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', className)} />
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">{toastItem.title}</p>
              {toastItem.description && <p className="mt-0.5 text-xs text-text-muted">{toastItem.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toastItem.id)}
              aria-label="Dismiss notification"
              className="text-text-muted hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
