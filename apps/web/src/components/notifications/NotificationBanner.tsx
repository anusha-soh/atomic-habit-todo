'use client';

import { useEffect, useState } from 'react';

export interface HabitNotification {
  id: string;
  type: 'HABIT_MISS' | 'STREAK_RESET';
  message: string;
}

interface NotificationBannerProps {
  notifications: HabitNotification[];
  onDismiss: (id: string) => void;
}

/**
 * Non-intrusive banner that shows missed-habit alerts at the top of the page.
 * Restyled T043 — Notebook design system (US7)
 * Auto-dismisses after 8 seconds.
 */
export function NotificationBanner({ notifications, onDismiss }: NotificationBannerProps) {
  const [visible, setVisible] = useState<Set<string>>(new Set());

  useEffect(() => {
    const ids = new Set(notifications.map((n) => n.id));
    setVisible(ids);
  }, [notifications]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-lg px-4">
      {notifications.map((notif) =>
        visible.has(notif.id) ? (
          <div
            key={notif.id}
            role="alert"
            className="flex items-start gap-3 rounded-xl px-4 py-3 bg-notebook-highlight-yellow shadow-notebook-md text-sm font-patrick-hand text-notebook-ink"
          >
            <span className="text-lg flex-shrink-0" aria-hidden>
              {notif.type === 'STREAK_RESET' ? String.fromCodePoint(0x26A0, 0xFE0F) : String.fromCodePoint(0x1F514)}
            </span>
            <span className="flex-1">{notif.message}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => onDismiss(notif.id)}
              className="text-notebook-ink-light hover:text-notebook-ink ml-2 flex-shrink-0"
            >
              {String.fromCharCode(0x2715)}
            </button>
          </div>
        ) : null
      )}
    </div>
  );
}
