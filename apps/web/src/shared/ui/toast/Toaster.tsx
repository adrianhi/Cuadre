import { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { toastStore, type ToastItem } from './toast-store';

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toastStore.subscribe((nextToasts) => {
      setToasts(nextToasts);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[9999] flex flex-col items-center gap-2 p-4 sm:bottom-4 sm:right-4 sm:top-auto sm:items-end sm:p-0"
    >
      {toasts.map((item) => {
        const isError = item.type === 'error';
        const isSuccess = item.type === 'success';
        const isWarning = item.type === 'warning';

        return (
          <div
            key={item.id}
            role={isError ? 'alert' : 'status'}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-3.5 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-4 sm:max-w-md ${
              isError
                ? 'border-destructive/30 bg-destructive/10 text-destructive dark:bg-destructive/20'
                : isSuccess
                ? 'border-emerald-500/30 bg-emerald-50/90 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-100 dark:border-emerald-500/20'
                : isWarning
                ? 'border-amber-500/30 bg-amber-50/90 text-amber-900 dark:bg-amber-950/80 dark:text-amber-100 dark:border-amber-500/20'
                : 'border-border bg-card/95 text-foreground dark:bg-slate-900/90'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isError && <AlertCircle className="h-5 w-5 text-destructive" />}
              {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
              {isWarning && <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
              {!isError && !isSuccess && !isWarning && <Info className="h-5 w-5 text-sky-600 dark:text-sky-400" />}
            </div>

            <div className="flex-1 space-y-0.5 text-left">
              {item.title && <p className="text-xs font-bold leading-tight">{item.title}</p>}
              <p className="text-xs font-medium leading-relaxed opacity-95">{item.message}</p>
            </div>

            <button
              type="button"
              aria-label="Cerrar notificación"
              onClick={() => toastStore.dismiss(item.id)}
              className="shrink-0 rounded-lg p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
