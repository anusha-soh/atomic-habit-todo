'use client';

import type { CompletionType } from '@/types/habit';

interface CompletionTypeModalProps {
  onSelect: (type: CompletionType) => void;
  onClose: () => void;
}

export function CompletionTypeModal({ onSelect, onClose }: CompletionTypeModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose completion type"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-xs w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Complete this habit</h2>
        <p className="text-sm text-gray-500 mb-5">Choose how you completed it today</p>

        <div className="flex flex-col gap-3">
          {/* Full habit button — large tap target */}
          <button
            type="button"
            onClick={() => onSelect('full')}
            className="flex items-center gap-3 w-full min-h-[56px] px-4 py-3 rounded-xl bg-green-50 border-2 border-green-200 hover:border-green-400 hover:bg-green-100 transition-colors text-left"
          >
            <span className="text-2xl">🏆</span>
            <div>
              <p className="font-medium text-gray-900">Full habit</p>
              <p className="text-xs text-gray-500">Complete version</p>
            </div>
          </button>

          {/* 2-minute version button */}
          <button
            type="button"
            onClick={() => onSelect('two_minute')}
            className="flex items-center gap-3 w-full min-h-[56px] px-4 py-3 rounded-xl bg-blue-50 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-100 transition-colors text-left"
          >
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-medium text-gray-900">2-minute version</p>
              <p className="text-xs text-gray-500">Never miss twice</p>
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
