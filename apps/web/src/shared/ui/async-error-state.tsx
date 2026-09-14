import { RefreshCw } from 'lucide-react';
import { cn } from '@/shared/lib';
import { Button } from './button';
import { SafeDiagnosticButton } from './safe-diagnostic-button';

interface AsyncErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
  error?: unknown;
  area?: string;
  className?: string;
}

export function AsyncErrorState(props: AsyncErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 p-6 text-center', props.className)} role="alert">
      <div>
        <p className="text-sm font-semibold">{props.title}</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{props.description}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {props.onRetry && (
          <Button onClick={props.onRetry} className="min-h-11 gap-2">
            <RefreshCw className="h-4 w-4" /> Reintentar
          </Button>
        )}
        {Boolean(props.error) && props.area && (
          <SafeDiagnosticButton error={props.error} area={props.area} className="min-h-11" />
        )}
      </div>
    </div>
  );
}
