import React from 'react';
import { Download, Loader2, MessageSquare, Share2 } from 'lucide-react';
import type { StatsSummary } from '@/entities/stat';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/shared/ui';
import { useCuadreDelMes } from '../model/useCuadreDelMes';
import { CuadreDelMesCard } from './CuadreDelMesCard';

export interface CuadreDelMesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStats?: StatsSummary | null;
  currency?: string;
}

export const CuadreDelMesModal: React.FC<CuadreDelMesModalProps> = ({
  open,
  onOpenChange,
  initialStats,
  currency = 'DOP',
}) => {
  const {
    selectedMonth,
    setSelectedMonth,
    protectedMode,
    setProtectedMode,
    cuadre,
    isLoading,
    isGenerating,
    handleDownload,
    handleShare,
    handleCopySummary,
    monthOptions,
    monthLabel,
  } = useCuadreDelMes({
    initialStats,
    currency,
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto border-border bg-card p-4 sm:p-6 sm:rounded-3xl shadow-2xl">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-xl font-black text-foreground">
            El Cuadre del Mes 🇩🇴
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Tu historia financiera estilo Spotify Wrapped lista para guardar y compartir.
          </p>
        </DialogHeader>

        {/* Controls Toolbar: Month Selector & Protected Mode Switch */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Mes:
            </span>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-8 w-44 rounded-xl text-xs font-bold">
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs font-medium">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            <label
              htmlFor="cuadre-protected-mode"
              className="text-xs font-medium text-foreground cursor-pointer select-none"
            >
              Modo Protegido
            </label>
            <Switch
              id="cuadre-protected-mode"
              checked={protectedMode}
              onCheckedChange={setProtectedMode}
            />
          </div>
        </div>

        {/* Card View */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs font-semibold text-muted-foreground">
              Preparando tu Cuadre del Mes...
            </p>
          </div>
        ) : (
          <div className="py-2">
            <CuadreDelMesCard cuadre={cuadre} monthLabel={monthLabel} />
          </div>
        )}

        {/* Actions Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleShare}
            disabled={isGenerating || isLoading}
            className="rounded-xl text-xs font-bold gap-1.5"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            Compartir
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isGenerating || isLoading}
            className="rounded-xl text-xs font-bold gap-1.5"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Descargar PNG
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopySummary}
            disabled={isLoading}
            className="rounded-xl text-xs font-bold gap-1.5"
          >
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
