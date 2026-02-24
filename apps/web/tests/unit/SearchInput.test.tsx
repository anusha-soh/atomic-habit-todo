/**
 * Unit Tests for SearchInput Component
 * 008-production-hardening (T037)
 * Tests rendering, debounced search, and clearing search param
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/tasks',
}));

import { SearchInput } from '@/components/tasks/SearchInput';

describe('SearchInput Component - T037', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockPush.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render a search input element', () => {
    render(<SearchInput />);

    const input = screen.getByLabelText('Search tasks');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should call router.push with search param after debounce delay', () => {
    render(<SearchInput />);

    const input = screen.getByLabelText('Search tasks');

    // fireEvent works synchronously — no timer conflicts
    fireEvent.change(input, { target: { value: 'meeting' } });

    // Before debounce — should not have pushed yet
    expect(mockPush).not.toHaveBeenCalled();

    // Advance past 300ms debounce
    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('search=meeting')
    );
  });

  it('should not call router.push before debounce delay elapses', () => {
    render(<SearchInput />);

    const input = screen.getByLabelText('Search tasks');
    fireEvent.change(input, { target: { value: 'test' } });

    // Only 100ms passed — debounce hasn't fired yet
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockPush).not.toHaveBeenCalled();

    // Now advance past debounce
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
  });
});
