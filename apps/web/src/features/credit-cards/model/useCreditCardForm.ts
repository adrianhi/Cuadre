import { useState, type KeyboardEvent } from 'react';
import type { CreateCreditCardInput, CreditCard, DetectedUnregisteredCard } from '@bills/contracts';

interface FormValues {
  institutionCode: string;
  alias: string;
  cardLast4: string;
  closingDay: number;
  graceDays: number;
  isDefault: boolean;
}

const DEFAULT_VALUES: FormValues = {
  institutionCode: 'POPULAR',
  alias: '',
  cardLast4: '',
  closingDay: 15,
  graceDays: 22,
  isDefault: false,
};

export function useCreditCardForm(options?: {
  initialCard?: CreditCard | null;
  onSubmit?: (values: CreateCreditCardInput) => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<FormValues>(() => {
    if (options?.initialCard) {
      return {
        institutionCode: options.initialCard.institutionCode,
        alias: options.initialCard.alias,
        cardLast4: options.initialCard.cardLast4,
        closingDay: options.initialCard.closingDay,
        graceDays: options.initialCard.graceDays,
        isDefault: options.initialCard.isDefault,
      };
    }
    return DEFAULT_VALUES;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const populateFromDetected = (detected: DetectedUnregisteredCard) => {
    setValues((prev) => ({
      ...prev,
      institutionCode: detected.institutionCode,
      cardLast4: detected.cardLast4,
      alias: `${detected.institutionCode} ${detected.cardLast4}`,
    }));
    setErrors({});
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!values.alias.trim()) {
      nextErrors.alias = 'El alias es requerido.';
    }
    if (!/^\d{4}$/.test(values.cardLast4.trim())) {
      nextErrors.cardLast4 = 'Deben ser exactamente 4 dígitos.';
    }
    if (Number.isNaN(values.closingDay) || values.closingDay < 1 || values.closingDay > 31) {
      nextErrors.closingDay = 'El día de corte debe ser entre 1 y 31.';
    }
    if (Number.isNaN(values.graceDays) || values.graceDays < 0) {
      nextErrors.graceDays = 'Los días de gracia no pueden ser negativos.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    options?.onSubmit?.({
      institutionCode: values.institutionCode.trim(),
      alias: values.alias.trim(),
      cardLast4: values.cardLast4.trim(),
      closingDay: Number(values.closingDay),
      graceDays: Number(values.graceDays),
      isDefault: values.isDefault,
      cardType: 'CREDIT',
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      options?.onCancel?.();
    }
  };

  const reset = () => {
    setValues(DEFAULT_VALUES);
    setErrors({});
  };

  return {
    values,
    errors,
    setField,
    submit,
    reset,
    populateFromDetected,
    handleKeyDown,
  };
}
