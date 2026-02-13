'use client';

import { useState } from 'react';
import { completeHabit } from '@/lib/habits-api';
import { playCompletionSound } from '@/lib/sound-player';
import type { CompletionType } from '@/types/habit';
import { CompletionTypeModal } from './CompletionTypeModal';

interface CompletionCheckboxProps {
  habitId: string;
  userId: string;
  isCompleted?: boolean;
  onComplete?: (newStreak: number) => void;
}

export function CompletionCheckbox({
  habitId,
  userId,
  isCompleted = false,
  onComplete,
}: CompletionCheckboxProps) {
  const [checked, setChecked] = useState(isCompleted);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleCheck = () => {
    if (checked || isSubmitting) return;
    setShowModal(true);
  };

  const handleCompletionTypeSelect = async (completionType: CompletionType) => {
    setShowModal(false);
    setIsSubmitting(true);
    // Play sound immediately (before API — provides instant feedback)
    playCompletionSound();

    try {
      const result = await completeHabit(userId, habitId, { completion_type: completionType });

      // Show success animation
      setChecked(true);
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 600);

      onComplete?.(result.current_streak);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('409')) {
        // Already completed today — treat as checked
        setChecked(true);
      }
      // Other errors: fail silently (UX continues)
      console.error('Failed to complete habit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label={checked ? 'Habit completed' : 'Mark habit as complete'}
        aria-pressed={checked}
        disabled={checked || isSubmitting}
        onClick={handleCheck}
        className={[
          'relative flex items-center justify-center',
          // 44×44px minimum tap target (mobile-first)
          'w-11 h-11 rounded-full border-2 transition-all duration-200',
          checked
            ? 'bg-green-500 border-green-500 cursor-default'
            : 'bg-white border-gray-300 hover:border-green-400 cursor-pointer',
          isSubmitting ? 'opacity-60' : '',
        ].join(' ')}
      >
        {/* Checkmark icon */}
        {checked && (
          <svg
            className={[
              'w-6 h-6 text-white',
              showAnimation ? 'animate-scale-in' : '',
            ].join(' ')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}

        {/* Spinner while submitting */}
        {isSubmitting && !checked && (
          <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        )}
      </button>

      {showModal && (
        <CompletionTypeModal
          onSelect={handleCompletionTypeSelect}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
