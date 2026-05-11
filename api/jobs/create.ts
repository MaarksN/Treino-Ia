import { handleApiError, HttpError, json, readJsonObject } from '../_lib/http';
import { getSupabaseAdmin, requireSupabaseUser } from '../_lib/server-supabase';

export const config = {
  runtime: 'nodejs',
};

const SUPPORTED_JOBS = new Set(['pdf_export', 'quarterly_ai_report', 'nutrition_report']);

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const user = await requireSupabaseUser(request);
    const body = await readJsonObject(request);
    const jobType = body.jobType;

    if (typeof jobType !== 'string' || !SUPPORTED_JOBS.has(jobType)) {
      throw new HttpError(400, 'Unsupported jobType.');
    }

    const payload = body.payload && typeof body.payload === 'object' && !Array.isArray(body.payload)
      ? body.payload
      : {};

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('background_jobs')
      .insert({
        user_id: user.id,
        job_type: jobType,
        payload,
      })
      .select('id, job_type, status, created_at')
      .single();

    if (error) {
      throw new Error(`Failed to queue job: ${error.message}`);
    }

    return json({ ok: true, job: data }, 202);
  } catch (error) {
    return handleApiError(error);
  }
}
