import { forwardRef } from 'react';
import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const fieldBaseClasses =
  'w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted ' +
  'transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }>(
  ({ className, children, required, ...props }, ref) => (
    <label ref={ref} className={cn('mb-1.5 block text-sm font-medium text-text-secondary', className)} {...props}>
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  ),
);
Label.displayName = 'Label';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { error?: string }>(
  ({ className, error, ...props }, ref) => (
    <input ref={ref} className={cn(fieldBaseClasses, 'h-10', error && 'border-red-400 focus:ring-red-400', className)} {...props} />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(fieldBaseClasses, 'min-h-[88px] py-2', error && 'border-red-400 focus:ring-red-400', className)}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, error, children, ...props }, ref) => (
  <div className="group relative">
    <select
      ref={ref}
      className={cn(
        fieldBaseClasses,
        'h-10 appearance-none bg-no-repeat pr-9 cursor-pointer',
        error && 'border-red-400 focus:ring-red-400',
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted transition-transform duration-200 group-focus-within:rotate-180 group-focus-within:text-brand-500" />
  </div>
));
Select.displayName = 'Select';

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-red-500">{message}</p>;
}

export function FormRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid gap-4 sm:grid-cols-2', className)}>{children}</div>;
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isTextArea?: boolean;
  type?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(({ label, error, isTextArea, type = 'text', ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {isTextArea ? (
        <Textarea ref={ref as any} error={error} {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <Input ref={ref} type={type} error={error} {...props} />
      )}
      <FieldError message={error} />
    </div>
  );
});
Field.displayName = 'Field';
