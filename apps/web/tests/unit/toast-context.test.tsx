/**
 * Unit Tests for Toast Context
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from '@/lib/toast-context';

const TestComponent = () => {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast('Test Message', 'success')}>
      Show Toast
    </button>
  );
};

describe('Toast Context', () => {
  it('should show and remove toast', async () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    const button = screen.getByText('Show Toast');
    act(() => {
      button.click();
    });
    
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    expect(screen.queryByText('Test Message')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
