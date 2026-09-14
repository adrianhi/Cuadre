import * as React from 'react';
import { formatAmountInput, formatAmountInputOnBlur } from '@/shared/lib';
import { Input, type InputProps } from './input';

export interface CurrencyAmountInputProps
  extends Omit<InputProps, 'type' | 'inputMode' | 'value' | 'onChange'> {
  value: string;
  onValueChange: (value: string) => void;
  formatDecimalsOnBlur?: boolean;
}

export const CurrencyAmountInput = React.forwardRef<HTMLInputElement, CurrencyAmountInputProps>(
  ({ value, onValueChange, formatDecimalsOnBlur = true, onBlur, ...props }, ref) => (
    <Input
      {...props}
      ref={ref}
      type="text"
      inputMode="decimal"
      value={value}
      onChange={(event) => onValueChange(formatAmountInput(event.target.value))}
      onBlur={(event) => {
        if (formatDecimalsOnBlur && value) onValueChange(formatAmountInputOnBlur(value));
        onBlur?.(event);
      }}
    />
  ),
);

CurrencyAmountInput.displayName = 'CurrencyAmountInput';
