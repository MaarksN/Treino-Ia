import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { getBearerToken, HttpError, requireEnv } from './http';

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new HttpError(500, 'SUPABASE_URL is not configured');
  }

  if (!serviceRoleKey) {
    throw new HttpError(500, 'SUPABASE_SERVICE_ROLE_KEY is not configured');
  }

  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}

export async function requireSupabaseUser(request: Request): Promise<User> {
  const token = getBearerToken(request);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new HttpError(401, 'Invalid or expired Supabase session');
  }

  return data.user;
}

