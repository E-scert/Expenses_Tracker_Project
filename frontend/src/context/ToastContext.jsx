import React, { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((message, variant = 'info') => {
    const id = ++idCounter;
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => dismiss(id), 4200);
  }, [dismiss]);

  const toast = {
    success: (msg) => push(msg, 'success'),
    error: (msg) => push(msg, 'error'),
    info: (msg) => push(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-[320px]">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={[
              'animate-toastIn rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-sm',
              t.variant === 'success' && 'bg-charcoal border-emerald-500/40 text-emerald-300',
              t.variant === 'error' && 'bg-charcoal border-blaze/60 text-red-300',
              t.variant === 'info' && 'bg-charcoal border-line text-paper/90',
            ].filter(Boolean).join(' ')}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
