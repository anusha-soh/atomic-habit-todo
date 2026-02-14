/**
 * Toast Context
 * Phase 2 Chunk 2 - Polish (T147)
 * Restyled T042 — Notebook design system (US7)
 *
 * Provides a simple toast notification system with notebook aesthetic
 */
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const borderColorMap: Record<ToastType, string> = {
  success: 'border-l-4 border-l-notebook-ink-green',
  error: 'border-l-4 border-l-notebook-ink-red',
  info: 'border-l-4 border-l-notebook-ink-blue',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`bg-notebook-paper-white shadow-notebook-lg rounded-lg p-4 border border-notebook-line ${borderColorMap[toast.type]} flex items-center justify-between min-w-[300px] animate-in slide-in-from-right-full`}
            style={{ transform: 'rotate(-0.5deg)' }}
          >
            <span className="font-patrick-hand text-base text-notebook-ink">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-notebook-ink-light hover:text-notebook-ink focus:outline-none"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
