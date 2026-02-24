/**
 * T011: Unit tests for habits-api.ts using API_BASE — no double-slash
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('habits-api uses API_BASE without double-slash', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/';
  });

  it('getHabits constructs URL without double slash', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ habits: [], total: 0, page: 1, limit: 50 }),
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const { getHabits } = await import('@/lib/habits-api');
    await getHabits('user-123');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const calledUrl = fetchSpy.mock.calls[0][0] as string;
    // After protocol, no double slashes
    const afterProtocol = calledUrl.replace(/^https?:\/\//, '');
    expect(afterProtocol).not.toContain('//');

    vi.unstubAllGlobals();
  });
});
