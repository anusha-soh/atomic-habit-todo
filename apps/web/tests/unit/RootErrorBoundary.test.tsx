/**
 * Unit Tests for Root Error Boundary (error.tsx)
 * 008-production-hardening (T029)
 * Tests error display, message rendering, and reset button functionality
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RootError from '@/app/error';

describe('RootError Component - T029', () => {
  const mockReset = vi.fn();

  it('should render "Something went wrong" heading', () => {
    render(<RootError error={new Error('Test error message')} reset={mockReset} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should display the error message text', () => {
    render(<RootError error={new Error('Test error message')} reset={mockReset} />);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should have a "Try again" button', () => {
    render(<RootError error={new Error('Test error message')} reset={mockReset} />);

    const button = screen.getByRole('button', { name: /try again/i });
    expect(button).toBeInTheDocument();
  });

  it('should call reset() when "Try again" button is clicked', async () => {
    const user = userEvent.setup();
    render(<RootError error={new Error('Test error message')} reset={mockReset} />);

    const button = screen.getByRole('button', { name: /try again/i });
    await user.click(button);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should display fallback text when error has no message', () => {
    const errorWithoutMessage = new Error();
    errorWithoutMessage.message = '';
    render(<RootError error={errorWithoutMessage} reset={mockReset} />);

    expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument();
  });
});
