import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

// Simple toast state management
let listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

const notify = () => {
  listeners.forEach((listener) => listener(toasts));
};

export const toast = {
  success: (message: string, duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    toasts = [...toasts, { id, type: 'success', message, duration }];
    notify();
  },
  error: (message: string, duration = 5000) => {
    const id = Math.random().toString(36).slice(2);
    toasts = [...toasts, { id, type: 'error', message, duration }];
    notify();
  },
  warning: (message: string, duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    toasts = [...toasts, { id, type: 'warning', message, duration }];
    notify();
  },
  info: (message: string, duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    toasts = [...toasts, { id, type: 'info', message, duration }];
    notify();
  },
};

const removeToast = (id: string) => {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
};

function ToastItem({ toast: t }: { toast: Toast }) {
  useEffect(() => {
    if (t.duration) {
      const timer = setTimeout(() => removeToast(t.id), t.duration);
      return () => clearTimeout(timer);
    }
  }, [t.id, t.duration]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const styles: Record<ToastType, string> = {
    success: 'bg-success-50 text-success-700 border-success-200',
    error: 'bg-danger-50 text-danger-700 border-danger-200',
    warning: 'bg-warning-50 text-warning-700 border-warning-200',
    info: 'bg-primary-50 text-primary-700 border-primary-200',
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
        animate-in slide-in-from-right fade-in duration-300
        ${styles[t.type]}
      `}
    >
      {icons[t.type]}
      <p className="text-sm font-medium">{t.message}</p>
      <button
        onClick={() => removeToast(t.id)}
        className="ml-auto p-1 rounded hover:bg-black/5 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setCurrentToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setCurrentToasts);
    };
  }, []);

  if (currentToasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {currentToasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>,
    document.body
  );
}
