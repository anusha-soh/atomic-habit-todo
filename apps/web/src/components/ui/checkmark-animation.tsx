'use client';

interface CheckmarkAnimationProps {
  /** Whether to show the checkmark animation */
  show: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  className?: string;
}

export function CheckmarkAnimation({ show, onComplete, className = '' }: CheckmarkAnimationProps) {
  if (!show) return null;

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      onAnimationEnd={onComplete}
    >
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--notebook-ink-green)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M5 13l4 4L19 7"
          strokeDasharray={24}
          strokeDashoffset={0}
          className="animate-draw-checkmark"
        />
      </svg>
    </div>
  );
}
