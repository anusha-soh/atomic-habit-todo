'use client';

/**
 * Sound player utility for habit completion feedback.
 * Uses HTML5 Audio with graceful fallback (no UX blocking on failure).
 */

let audioInstance: HTMLAudioElement | null = null;

/**
 * Play the completion sound effect (sparkle/chime).
 * Fails silently if audio is unavailable or loading fails.
 */
export function playCompletionSound(volume = 0.5): void {
  try {
    // Reuse instance to avoid re-creating on each play
    if (!audioInstance) {
      audioInstance = new Audio('/sounds/sparkle.mp3');
      audioInstance.volume = volume;
    }
    // Reset to start so rapid clicks replay from beginning
    audioInstance.currentTime = 0;
    audioInstance.play().catch((err) => {
      // Mobile browsers require user gesture — fail silently
      console.error('Sound playback failed (non-critical):', err);
    });
  } catch (err) {
    // new Audio() may throw in SSR or restricted environments
    console.error('Sound player init failed (non-critical):', err);
  }
}
