import { describe, it, expect, vi, beforeEach } from 'vitest';
import exportHandler from '../export';
import erasureHandler from '../erasure';

const mockGetBearerToken = vi.fn();
const mockJson = vi.fn((body: any, status: number) => ({ body, status }));
const mockHandleApiError = vi.fn();

vi.mock('../../_lib/http', () => ({
  getBearerToken: (req: any) => mockGetBearerToken(req),
  json: (body: any, status: number, req: any) => mockJson(body, status),
  handleApiError: (err: any, req: any) => mockHandleApiError(err, req),
}));

const mockSupabaseAdmin = {
  auth: {
    getUser: vi.fn(),
    admin: {
      deleteUser: vi.fn(),
    },
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn().mockResolvedValue({ data: {} }),
        single: vi.fn().mockResolvedValue({ data: {} }),
        then: vi.fn().mockImplementation((cb) => Promise.resolve({ data: [] }).then(cb)),
      })),
    })),
  })),
};

vi.mock('../../_lib/server-supabase', () => ({
  getSupabaseAdmin: () => mockSupabaseAdmin,
}));

vi.mock('../../_lib/billing-entitlements', () => ({
  getServerEntitlement: vi.fn().mockResolvedValue(null),
}));

vi.mock('../../_lib/distributedRateLimit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 4,
    resetAt: Date.now() + 60_000,
  }),
}));

vi.mock('../../_lib/stripe-client', () => ({
  getStripeClient: vi.fn(() => ({
    subscriptions: {
      cancel: vi.fn().mockResolvedValue({}),
    },
  })),
}));

describe('Compliance APIs (TIPO 11 - LGPD)', () => {
  let mockRequest: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = { method: 'POST' } as unknown as Request;
    mockGetBearerToken.mockReturnValue('mock-token');
  });

  describe('Export API', () => {
    it('returns 401 if unauthorized', async () => {
      mockSupabaseAdmin.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: new Error('Auth error'),
      });
      const res = (await exportHandler(mockRequest)) as any;
      expect(res.status).toBe(401);
    });

    it('returns aggregated user data in JSON format', async () => {
      mockSupabaseAdmin.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'u1', email: 'test@test.com', created_at: '2026' } },
        error: null,
      });

      const res = (await exportHandler(mockRequest)) as any;
      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe('u1');
      expect(res.body.user.email).toBe('test@test.com');
      expect(res.body).toHaveProperty('exported_at');
      expect(res.body).toHaveProperty('profile');
      expect(res.body).toHaveProperty('ai_audits');
      expect(res.body).toHaveProperty('meals');
      expect(res.body).toHaveProperty('hydration_entries');
      expect(res.body).toHaveProperty('billing_invoices');
      expect(res.body).toHaveProperty('social_posts');
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('nutrition_meal_entries');
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('billing_invoice_receipts');
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('social_posts');
    });
  });

  describe('Erasure API', () => {
    it('returns 401 if unauthorized', async () => {
      mockSupabaseAdmin.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: new Error('Auth error'),
      });
      const res = (await erasureHandler(mockRequest)) as any;
      expect(res.status).toBe(401);
    });

    it('orchestrates physical deletion of user', async () => {
      mockSupabaseAdmin.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'u1', email: 'test@test.com' } },
        error: null,
      });
      mockSupabaseAdmin.auth.admin.deleteUser.mockResolvedValueOnce({ error: null });

      const res = (await erasureHandler(mockRequest)) as any;
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockSupabaseAdmin.auth.admin.deleteUser).toHaveBeenCalledWith('u1');
    });

    it('returns 500 if physical deletion fails', async () => {
      mockSupabaseAdmin.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'u1', email: 'test@test.com' } },
        error: null,
      });
      mockSupabaseAdmin.auth.admin.deleteUser.mockResolvedValueOnce({
        error: new Error('DB Error'),
      });

      const res = (await erasureHandler(mockRequest)) as any;
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to erase data physically');
    });
  });
});
