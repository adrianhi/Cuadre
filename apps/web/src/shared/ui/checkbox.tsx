import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, defaultChecked, onChange, onCheckedChange, disabled, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <span className="relative inline-flex items-center justify-center shrink-0">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            'peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-md border border-primary/70 bg-background shadow-2xs transition-colors',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'checked:border-primary checked:bg-primary checked:text-primary-foreground',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />
        <Check
          className="pointer-events-none absolute h-3 w-3 stroke-[3] text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity"
          aria-hidden="true"
        />
      </span>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
