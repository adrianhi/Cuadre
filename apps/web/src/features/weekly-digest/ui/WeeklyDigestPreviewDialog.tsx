import { useState } from 'react';
import { AlertCircle, CheckCircle2, Mail, Send, Sparkles } from 'lucide-react';
import { useSendWeeklyDigestTest, useWeeklyDigestPreview } from '@/entities/proactive';
import { normalizeApiError } from '@/shared/api';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toast,
} from '@/shared/ui';

export interface WeeklyDigestPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
}

export function WeeklyDigestPreviewDialog({
  open,
  onOpenChange,
  currency,
}: WeeklyDigestPreviewDialogProps) {
  const activeCurrency = currency === 'USD' ? 'USD' : 'DOP';
  const preview = useWeeklyDigestPreview(activeCurrency, open);
  const sendTestMutation = useSendWeeklyDigestTest();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSendTest = async () => {
    setFeedback(null);
    try {
      const res = await sendTestMutation.mutateAsync({ currency: activeCurrency });
      const msg = res.mode === 'SMTP'
        ? `¡Correo de prueba enviado con éxito a ${res.recipient || 'tu correo'}!`
        : 'Prueba registrada en modo auditoría.';
      setFeedback({ type: 'success', message: msg });
      toast.success(msg);
    } catch (err) {
      const apiErr = normalizeApiError(err);
      const msg = apiErr.message || 'No se pudo enviar el correo de prueba.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-6">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Pulso Semanal
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Mail className="h-3 w-3" /> Correo automatizado
            </span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Resumen Semanal por Correo
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Así luce el reporte de tus últimos siete días, próximos cobros y margen diario.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-3">
          {preview.isLoading ? (
            <div className="h-72 animate-pulse rounded-xl bg-muted" />
          ) : preview.data?.html ? (
            <div className="h-80 w-full overflow-hidden rounded-xl border border-border bg-slate-950 shadow-inner">
              <iframe
                title="Vista previa del correo semanal"
                srcDoc={preview.data.html}
                className="h-full w-full border-0"
                sandbox="allow-same-origin"
              />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No se pudo cargar la vista previa.</p>
          )}

          {feedback && (
            <div
              role={feedback.type === 'error' ? 'alert' : 'status'}
              className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs animate-in fade-in ${
                feedback.type === 'error'
                  ? 'border-destructive/30 bg-destructive/10 text-destructive'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {feedback.type === 'error' ? (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              )}
              <div className="flex-1 space-y-0.5">
                <p className="font-bold leading-tight">
                  {feedback.type === 'error' ? 'Error al enviar prueba' : 'Envío completado'}
                </p>
                <p className="text-[11px] opacity-90 leading-relaxed">{feedback.message}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" className="text-xs" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button
            className="text-xs gap-1.5"
            disabled={sendTestMutation.isPending || preview.isLoading}
            onClick={handleSendTest}
          >
            <Send className="h-3.5 w-3.5" />
            {sendTestMutation.isPending ? 'Enviando...' : 'Enviar correo de prueba'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
