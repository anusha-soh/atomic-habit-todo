'use client';

import { useEffect } from 'react';
import type { CompletionType } from '@/types/habit';

interface CompletionTypeModalProps {
  onSelect: (type: CompletionType) => void;
  onClose: () => void;
}

/**
 * CompletionTypeModal
 * Restyled T044 — Notebook design system (US7)
 */
export function CompletionTypeModal({ onSelect, onClose }: CompletionTypeModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose completion type"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-notebook-paper-white rounded-xl shadow-notebook-lg border border-notebook-line max-w-xs w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-caveat text-2xl text-notebook-ink mb-1">Complete this habit</h2>
        <p className="text-sm font-inter text-notebook-ink-medium mb-5">Choose how you completed it today</p>

        <div className="flex flex-col gap-3">
          {/* Full habit button */}
          <button
            type="button"
            onClick={() => onSelect('full')}
            className="flex items-center gap-3 w-full min-h-[56px] px-4 py-3 rounded-lg bg-notebook-paper-alt hover:bg-notebook-highlight-yellow border border-notebook-line transition-colors text-left font-patrick-hand text-notebook-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notebook-ink-blue focus-visible:ring-offset-1"
          >
            <span className="text-2xl">{String.fromCodePoint(0x1F3C6)}</span>
            <div>
              <p className="font-patrick-hand text-base text-notebook-ink">Full habit</p>
              <p className="text-xs font-inter text-notebook-ink-medium">Complete version</p>
            </div>
          </button>

          {/* 2-minute version button */}
          <button
            type="button"
            onClick={() => onSelect('two_minute')}
            className="flex items-center gap-3 w-full min-h-[56px] px-4 py-3 rounded-lg bg-notebook-paper-alt hover:bg-notebook-highlight-yellow border border-notebook-line transition-colors text-left font-patrick-hand text-notebook-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notebook-ink-blue focus-visible:ring-offset-1"
          >
            <span className="text-2xl">{String.fromCodePoint(0x26A1)}</span>
            <div>
              <p className="font-patrick-hand text-base text-notebook-ink">2-minute version</p>
              <p className="text-xs font-inter text-notebook-ink-medium">Never miss twice</p>
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm text-notebook-ink-light hover:text-notebook-ink transition-colors font-patrick-hand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notebook-ink-blue focus-visible:ring-offset-1"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
