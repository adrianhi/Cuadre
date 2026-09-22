import type { CreateCreditCardInput, CreditCard, DetectedUnregisteredCard } from '@bills/contracts';
import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import { SUPPORTED_BANKS } from '../model/bank-theme';
import { getBankDefaultGraceDays } from '../model/closing-date-solver';
import { useCreditCardForm } from '../model/useCreditCardForm';
import { CardCutDateSelector } from './CardCutDateSelector';

interface CardFormSectionProps {
  cardToEdit?: CreditCard | null;
  detectedCard?: DetectedUnregisteredCard | null;
  isPending: boolean;
  onSubmit: (values: CreateCreditCardInput) => void;
  onCancel: () => void;
}

export function CardFormSection({
  cardToEdit,
  detectedCard,
  isPending,
  onSubmit,
  onCancel,
}: CardFormSectionProps) {
  const { values, errors, setField, submit, handleKeyDown, populateFromDetected } = useCreditCardForm({
    initialCard: cardToEdit,
    onSubmit,
    onCancel,
  });

  // Pre-fill from detected if provided
  if (detectedCard && !cardToEdit && values.cardLast4 === '') {
    populateFromDetected(detectedCard);
  }

  const isEditing = Boolean(cardToEdit);

  return (
    <Card className="border-border bg-card shadow-sm" onKeyDown={handleKeyDown}>
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-foreground">
            {isEditing ? 'Editar Tarjeta' : 'Registrar Nueva Tarjeta'}
          </h4>
          <span className="text-[11px] text-muted-foreground">
            Presiona <kbd className="rounded border px-1 py-0.5 text-[10px] bg-muted">Enter</kbd> para guardar
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Banco */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Banco / Emisor</label>
            <Select
              value={values.institutionCode}
              onValueChange={(val) => {
                setField('institutionCode', val);
                setField('graceDays', getBankDefaultGraceDays(val));
              }}
            >
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Selecciona el banco" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_BANKS.map((bank) => (
                  <SelectItem key={bank.code} value={bank.code}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alias */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Alias o Nombre</label>
            <Input
              type="text"
              placeholder="Ej: Visa BHD Premia"
              value={values.alias}
              onChange={(e) => setField('alias', e.target.value)}
              className="h-10 rounded-xl"
            />
            {errors.alias && <p className="text-[11px] text-destructive">{errors.alias}</p>}
          </div>

          {/* Últimos 4 dígitos */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-foreground">Últimos 4 dígitos</label>
            <Input
              type="text"
              maxLength={4}
              placeholder="1234"
              value={values.cardLast4}
              onChange={(e) => setField('cardLast4', e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="h-10 rounded-xl font-mono"
            />
            {errors.cardLast4 && <p className="text-[11px] text-destructive">{errors.cardLast4}</p>}
          </div>

          {/* Selector interactivo de fecha de corte con pregunta inversa */}
          <CardCutDateSelector
            institutionCode={values.institutionCode}
            closingDay={values.closingDay}
            graceDays={values.graceDays}
            onClosingDayChange={(day) => setField('closingDay', day)}
            onGraceDaysChange={(days) => setField('graceDays', days)}
            closingDayError={errors.closingDay}
            graceDaysError={errors.graceDays}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-xl text-xs font-semibold"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={submit}
            disabled={isPending}
            className="rounded-xl text-xs font-bold"
          >
            {isPending ? 'Guardando…' : isEditing ? 'Actualizar Tarjeta' : 'Registrar Tarjeta'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
