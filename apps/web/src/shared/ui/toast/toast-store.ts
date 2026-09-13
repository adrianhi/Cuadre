export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

export class ToastStore {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  public subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener([...this.toasts]);
    }
  }

  public show(options: { type?: ToastType; title?: string; message: string; duration?: number }): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const duration = options.duration ?? (options.type === 'error' ? 6000 : 4500);
    const toast: ToastItem = {
      id,
      type: options.type ?? 'info',
      title: options.title,
      message: options.message,
      duration,
    };

    // Keep maximum 5 toasts at once
    this.toasts = [...this.toasts.slice(-4), toast];
    this.notify();

    if (duration > 0) {
      const timer = setTimeout(() => {
        this.dismiss(id);
      }, duration);
      this.timers.set(id, timer);
    }

    return id;
  }

  public dismiss(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  public clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.toasts = [];
    this.notify();
  }

  public getToasts(): ToastItem[] {
    return [...this.toasts];
  }
}

export const toastStore = new ToastStore();

export const toast = {
  success: (message: string, title?: string, duration?: number) =>
    toastStore.show({ type: 'success', message, title, duration }),
  error: (message: string, title?: string, duration?: number) =>
    toastStore.show({ type: 'error', message, title, duration }),
  warning: (message: string, title?: string, duration?: number) =>
    toastStore.show({ type: 'warning', message, title, duration }),
  info: (message: string, title?: string, duration?: number) =>
    toastStore.show({ type: 'info', message, title, duration }),
  dismiss: (id: string) => toastStore.dismiss(id),
  clear: () => toastStore.clear(),
};
