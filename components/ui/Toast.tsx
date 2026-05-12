'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons = {
  success: <CheckCircle size={16} className="text-[var(--success)]" />,
  error: <AlertCircle size={16} className="text-[var(--danger)]" />,
  info: <Info size={16} className="text-[var(--accent)]" />,
};

const borderColors = {
  success: 'border-l-[var(--success)]',
  error: 'border-l-[var(--danger)]',
  info: 'border-l-[var(--accent)]',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`
                pointer-events-auto flex items-center gap-3
                bg-[var(--bg-surface)] border border-[#333]
                border-l-4 ${borderColors[t.type]}
                rounded px-4 py-3 min-w-[280px] max-w-sm
                shadow-xl
              `}
            >
              {icons[t.type]}
              <span className="text-sm font-satoshi text-[var(--text-primary)] flex-1">{t.message}</span>
              <button
                onClick={() => remove(t.id)}
                className="text-[var(--text-muted)] hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
