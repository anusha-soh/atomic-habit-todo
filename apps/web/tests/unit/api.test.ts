/**
 * Unit Tests for API Client
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, authAPI, APIError } from '@/lib/api';

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful GET requests', async () => {
    const mockData = { id: 1, name: 'Test' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await api.get('/test');
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('should handle API errors', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    });

    await expect(api.get('/test')).rejects.toThrow(APIError);
  });

  it('should handle network failures', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network failure'));

    await expect(api.get('/test')).rejects.toThrow('Network failure');
  });

  describe('authAPI', () => {
    it('should call login endpoint', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { id: '1' } }),
      });

      await authAPI.login('test@example.com', 'password');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
        })
      );
    });
  });
});
