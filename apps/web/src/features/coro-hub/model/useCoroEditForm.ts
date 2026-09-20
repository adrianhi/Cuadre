import { useState } from 'react';
import { coroService } from '@/entities/coro';
import { toast } from '@/shared/ui';

interface UseCoroEditFormOptions {
  coroId: string;
  initialName: string;
  initialDescription?: string | null;
  onSuccess: () => Promise<void>;
  onClose: () => void;
}

export function useCoroEditForm({
  coroId,
  initialName,
  initialDescription,
  onSuccess,
  onClose,
}: UseCoroEditFormOptions) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? '');
  const [pending, setPending] = useState(false);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      toast.error('El nombre del coro debe tener al menos 2 caracteres.');
      return;
    }

    setPending(true);
    try {
      await coroService.update(coroId, {
        name: trimmedName,
        description: description.trim() ? description.trim() : null,
      });
      toast.success('Información del coro actualizada.');
      await onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos actualizar el coro.');
    } finally {
      setPending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return {
    name,
    setName,
    description,
    setDescription,
    pending,
    handleSubmit,
    handleKeyDown,
  };
}
