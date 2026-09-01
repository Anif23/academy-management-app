import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded border-border text-brand-600 focus:ring-2 focus:ring-brand-500 focus:ring-offset-0',
        className,
      )}
      {...props}
    />
  ),
);
Checkbox.displayName = 'Checkbox';
