/**
 * T010: Unit tests for auth-api.ts using API_BASE
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('auth-api uses API_BASE', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
  });

  it('login calls API_BASE, not hardcoded localhost', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: { id: '1', email: 'a@b.com' }, session: { id: 's1', expires_at: '' } }),
      status: 200,
      statusText: 'OK',
    });
    vi.stubGlobal('fetch', fetchSpy);

    const { login } = await import('@/lib/auth-api');
    await login({ email: 'a@b.com', password: 'pass' });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const calledUrl = fetchSpy.mock.calls[0][0] as string;
    expect(calledUrl).toContain('https://api.example.com');
    expect(calledUrl).not.toContain('http://localhost');

    vi.unstubAllGlobals();
  });
});
