import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { statsService, type StatsSummary } from '@/entities/stat';
import { formatMonthLabel } from '@/shared/lib';
import { toast } from '@/shared/ui';
import { calculateCuadreDelMes, formatWhatsAppSummary, type CuadreDelMesData } from './wrapped-calculator';
import { downloadWrappedImage, generateWrappedCanvas, shareWrappedImage } from './wrapped-canvas';

export function getDefaultWrappedMonth(): string {
  const now = new Date();
  if (now.getDate() <= 5) {
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
  }
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getRecentMonths(count = 6): Array<{ value: string; label: string }> {
  const result: Array<{ value: string; label: string }> = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    result.push({ value, label: formatMonthLabel(value) });
  }
  return result;
}

export interface UseCuadreDelMesOptions {
  initialStats?: StatsSummary | null;
  currency?: string;
  defaultMonth?: string;
  enabled?: boolean;
}

export interface UseCuadreDelMesResult {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  protectedMode: boolean;
  setProtectedMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  cuadre: CuadreDelMesData;
  isLoading: boolean;
  isGenerating: boolean;
  handleDownload: () => Promise<void>;
  handleShare: () => Promise<void>;
  handleCopySummary: () => Promise<void>;
  monthOptions: Array<{ value: string; label: string }>;
  monthLabel: string;
}

export function useCuadreDelMes(options: UseCuadreDelMesOptions = {}): UseCuadreDelMesResult {
  const {
    initialStats,
    currency = 'DOP',
    defaultMonth = getDefaultWrappedMonth(),
    enabled = true,
  } = options;

  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);
  const [protectedMode, setProtectedMode] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const monthOptions = useMemo(() => getRecentMonths(6), []);
  const monthLabel = useMemo(() => formatMonthLabel(selectedMonth), [selectedMonth]);

  const query = useQuery({
    queryKey: ['stats', 'summary', { currency, month: selectedMonth }],
    queryFn: ({ signal }) => statsService.summary({ currency, month: selectedMonth }, signal),
    initialData: initialStats?.period === selectedMonth ? initialStats : undefined,
    enabled,
    placeholderData: (previous) => previous,
  });

  const stats = query.data ?? initialStats ?? null;

  const cuadre = useMemo(
    () => calculateCuadreDelMes(stats, protectedMode, monthLabel),
    [stats, protectedMode, monthLabel]
  );

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      const canvas = generateWrappedCanvas(cuadre, monthLabel);
      const filename = `cuadre-${selectedMonth}.png`;
      await downloadWrappedImage(canvas, filename);
      toast.success('¡Historia descargada con éxito!');
    } catch {
      toast.error('No se pudo generar la imagen para descargar');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsGenerating(true);
      const canvas = generateWrappedCanvas(cuadre, monthLabel);
      const filename = `cuadre-${selectedMonth}.png`;
      const title = `Mi Cuadre del Mes - ${monthLabel}`;
      const outcome = await shareWrappedImage(canvas, title, filename);
      if (outcome === 'shared') {
        toast.success('¡Historia compartida con éxito!');
      } else if (outcome === 'downloaded') {
        toast.success('Imagen descargada en tu dispositivo para compartir');
      }
    } catch {
      toast.error('No se pudo compartir la imagen');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySummary = async () => {
    try {
      const summaryText = formatWhatsAppSummary(cuadre, protectedMode);
      await navigator.clipboard.writeText(summaryText);
      toast.success('¡Resumen copiado para WhatsApp!');
    } catch {
      toast.error('No se pudo copiar el texto al portapapeles');
    }
  };

  return {
    selectedMonth,
    setSelectedMonth,
    protectedMode,
    setProtectedMode,
    cuadre,
    isLoading: query.isLoading && !stats,
    isGenerating,
    handleDownload,
    handleShare,
    handleCopySummary,
    monthOptions,
    monthLabel,
  };
}
