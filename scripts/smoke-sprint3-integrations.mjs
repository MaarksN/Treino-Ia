#!/usr/bin/env node

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value.replace(/\/+$/, '');
};

const optional = (name, fallback = '') => process.env[name] || fallback;

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  return { response, body };
}

function assertStatus(label, actual, expected) {
  const allowed = Array.isArray(expected) ? expected : [expected];
  if (!allowed.includes(actual)) {
    throw new Error(`${label}: expected ${allowed.join('/')} but got ${actual}`);
  }
}

async function smokeSupabaseRls() {
  const supabaseUrl = required('SUPABASE_URL');
  const anonKey = required('SUPABASE_ANON_KEY');
  const headers = { apikey: anonKey };
  const criticalTables = [
    'training_user_profiles',
    'training_workout_plans',
    'workout_sessions',
    'set_logs',
    'ai_recommendations',
    'billing_subscriptions',
    'billing_usage_counters',
    'stripe_webhook_events',
    'health_integration_tokens',
    'telemetry_error_events',
  ];

  for (const table of criticalTables) {
    const { response } = await requestJson(`${supabaseUrl}/rest/v1/${table}?select=*&limit=1`, { headers });
    assertStatus(`Supabase anon SELECT ${table}`, response.status, 200);
  }

  const workoutInsert = await requestJson(`${supabaseUrl}/rest/v1/workout_sessions`, {
    method: 'POST',
    headers: { ...headers, 'content-type': 'application/json', prefer: 'return=minimal' },
    body: JSON.stringify({
      user_id: '00000000-0000-0000-0000-000000000000',
      day_name: 'RLS smoke',
      metadata_json: {},
    }),
  });
  assertStatus('Supabase anon INSERT workout_sessions blocked', workoutInsert.response.status, [401, 403]);

  const telemetryInsert = await requestJson(`${supabaseUrl}/rest/v1/telemetry_error_events`, {
    method: 'POST',
    headers: { ...headers, 'content-type': 'application/json', prefer: 'return=minimal' },
    body: JSON.stringify({ source: 'sprint3-smoke', message: 'anon insert should fail' }),
  });
  assertStatus('Supabase anon INSERT telemetry_error_events blocked', telemetryInsert.response.status, [401, 403]);

  console.log('PASS supabase-rls');
}

async function smokeGemini(appUrl, token) {
  const payload = {
    contents: [{ role: 'user', parts: [{ text: 'Responda apenas: ok' }] }],
  };

  const unauth = await requestJson(`${appUrl}/api/gemini-proxy`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  assertStatus('Gemini unauthenticated request blocked', unauth.response.status, 401);

  if (!token) {
    console.log('SKIP gemini-authenticated: SUPABASE_TEST_ACCESS_TOKEN missing');
    return;
  }

  const response = await requestJson(`${appUrl}/api/gemini-proxy`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (optional('GEMINI_SMOKE_EXPECT_SUCCESS') === 'true') {
    assertStatus('Gemini authenticated real call', response.response.status, 200);
  } else {
    assertStatus('Gemini authenticated controlled status', response.response.status, [200, 402, 429, 500, 502, 503]);
  }

  console.log(`PASS gemini status=${response.response.status}`);
}

async function smokeStripe(appUrl, token) {
  if (!token) {
    console.log('SKIP stripe-checkout: SUPABASE_TEST_ACCESS_TOKEN missing');
    return;
  }

  const checkout = await requestJson(`${appUrl}/api/stripe/create-checkout-session`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      origin: appUrl,
    },
    body: JSON.stringify({
      planId: optional('STRIPE_SMOKE_PLAN_ID', 'pro'),
      interval: optional('STRIPE_SMOKE_INTERVAL', 'month'),
    }),
  });

  assertStatus('Stripe checkout controlled status', checkout.response.status, [200, 503]);
  if (checkout.response.status === 200 && typeof checkout.body?.checkoutUrl !== 'string') {
    throw new Error('Stripe checkout did not return checkoutUrl');
  }

  const portal = await requestJson(`${appUrl}/api/stripe/create-portal-session`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      origin: appUrl,
    },
  });
  assertStatus('Stripe portal controlled status', portal.response.status, [200, 400, 503]);

  console.log(`PASS stripe checkout=${checkout.response.status} portal=${portal.response.status}`);
}

async function main() {
  await smokeSupabaseRls();

  const appUrl = optional('STAGING_APP_URL').replace(/\/+$/, '');
  const token = optional('SUPABASE_TEST_ACCESS_TOKEN');

  if (!appUrl) {
    console.log('SKIP deployed-api-smoke: STAGING_APP_URL missing');
    return;
  }

  await smokeGemini(appUrl, token);
  await smokeStripe(appUrl, token);
}

main().catch((error) => {
  console.error(`FAIL ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
