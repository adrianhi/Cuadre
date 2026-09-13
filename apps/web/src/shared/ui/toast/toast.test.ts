import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ToastStore } from './toast-store';

describe('ToastStore', () => {
  let store: ToastStore;

  beforeEach(() => {
    vi.useFakeTimers();
    store = new ToastStore();
  });

  it('shows a toast and notifies listeners', () => {
    const listener = vi.fn();
    store.subscribe(listener);

    expect(listener).toHaveBeenCalledWith([]);

    store.show({ type: 'success', message: 'Operación exitosa', title: 'Listo' });

    expect(listener).toHaveBeenLastCalledWith([
      expect.objectContaining({
        type: 'success',
        message: 'Operación exitosa',
        title: 'Listo',
      }),
    ]);
  });

  it('auto-dismisses after the specified duration', () => {
    store.show({ type: 'info', message: 'Descargando...', duration: 2000 });
    expect(store.getToasts()).toHaveLength(1);

    vi.advanceTimersByTime(2000);
    expect(store.getToasts()).toHaveLength(0);
  });

  it('allows manual dismiss of a toast', () => {
    const id = store.show({ type: 'error', message: 'Falló' });
    expect(store.getToasts()).toHaveLength(1);

    store.dismiss(id);
    expect(store.getToasts()).toHaveLength(0);
  });

  it('clears all toasts', () => {
    store.show({ type: 'info', message: 'Uno' });
    store.show({ type: 'warning', message: 'Dos' });
    expect(store.getToasts()).toHaveLength(2);

    store.clear();
    expect(store.getToasts()).toHaveLength(0);
  });

  it('unsubscribes listener cleanly', () => {
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    listener.mockClear();
    unsubscribe();

    store.show({ type: 'info', message: 'Silencioso' });
    expect(listener).not.toHaveBeenCalled();
  });
});
