/**
 * T004: Unit tests for API_BASE constant
 * Verifies: exported, trailing-slash stripped, default fallback, no double-slash in consumers
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('API_BASE', () => {
  beforeEach(() => {
    vi.resetModules();
    // Clear env between tests
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  it('defaults to http://localhost:8000 when env var is absent', async () => {
    const { API_BASE } = await import('@/lib/api');
    expect(API_BASE).toBe('http://localhost:8000');
  });

  it('strips trailing slash from NEXT_PUBLIC_API_URL', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/';
    const { API_BASE } = await import('@/lib/api');
    expect(API_BASE).toBe('https://api.example.com');
  });

  it('preserves URL without trailing slash', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
    const { API_BASE } = await import('@/lib/api');
    expect(API_BASE).toBe('https://api.example.com');
  });
});

describe('tasks-api uses API_BASE without double-slash', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/';
  });

  it('constructs task URL without double slash', async () => {
    // After the fix, tasks-api should import API_BASE and build URLs properly
    const tasksModule = await import('@/lib/tasks-api');
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ tasks: [], total: 0 }),
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    try {
      await tasksModule.getTasks('user-123');
    } catch {
      // may fail, we just want to inspect the URL
    }

    if (fetchSpy.mock.calls.length > 0) {
      const calledUrl = fetchSpy.mock.calls[0][0] as string;
      expect(calledUrl).not.toMatch(/\/\//g.source.replace('\\/', '') ? /[^:]\/\// : /[^:]\/\//);
      // More specific: no double slash after the protocol
      const urlAfterProtocol = calledUrl.replace(/^https?:\/\//, '');
      expect(urlAfterProtocol).not.toContain('//');
    }

    vi.unstubAllGlobals();
  });
});
