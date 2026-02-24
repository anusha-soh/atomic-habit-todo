/**
 * Unit Tests for Next.js Middleware
 * 008-production-hardening (T014)
 * Tests route protection: unauthenticated users redirected to /login
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/server before importing middleware
vi.mock('next/server', () => {
  class MockNextResponse {
    status: number;
    headers: Map<string, string>;

    constructor(body: null, init: { status: number; headers: Record<string, string> }) {
      this.status = init.status;
      this.headers = new Map(Object.entries(init.headers));
    }

    static redirect(url: URL | string) {
      const redirectUrl = typeof url === 'string' ? url : url.toString();
      return new MockNextResponse(null, {
        status: 307,
        headers: { location: redirectUrl },
      });
    }

    static next() {
      return new MockNextResponse(null, { status: 200, headers: {} });
    }
  }

  return { NextResponse: MockNextResponse };
});

function createMockRequest(url: string, cookies: Record<string, string> = {}) {
  const parsedUrl = new URL(url);
  return {
    nextUrl: parsedUrl,
    url,
    cookies: {
      has: (name: string) => name in cookies,
      get: (name: string) => cookies[name] ? { name, value: cookies[name] } : undefined,
    },
  };
}

// Import after mocks are set up
import { middleware } from '@/middleware';

describe('Middleware - T014', () => {
  it('should redirect /tasks to /login when no auth_token cookie', () => {
    const request = createMockRequest('http://localhost:3000/tasks');
    const response = middleware(request as any);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/login');
  });

  it('should redirect /habits to /login when no auth_token cookie', () => {
    const request = createMockRequest('http://localhost:3000/habits');
    const response = middleware(request as any);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/login');
  });

  it('should redirect /dashboard to /login when no auth_token cookie', () => {
    const request = createMockRequest('http://localhost:3000/dashboard');
    const response = middleware(request as any);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/login');
  });

  it('should allow access to /tasks when auth_token cookie is present', () => {
    const request = createMockRequest('http://localhost:3000/tasks', {
      auth_token: 'valid-token',
    });
    const response = middleware(request as any);

    expect(response.status).toBe(200);
  });

  it('should redirect authenticated users from /login to /dashboard', () => {
    const request = createMockRequest('http://localhost:3000/login', {
      auth_token: 'valid-token',
    });
    const response = middleware(request as any);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/dashboard');
  });

  it('should redirect authenticated users from /register to /dashboard', () => {
    const request = createMockRequest('http://localhost:3000/register', {
      auth_token: 'valid-token',
    });
    const response = middleware(request as any);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/dashboard');
  });
});
