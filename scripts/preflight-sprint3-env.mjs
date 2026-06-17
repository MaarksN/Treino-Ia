#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const env = process.env;
const failures = [];
const warnings = [];
const passes = [];

const allowMissing = env.SPRINT3_PREFLIGHT_ALLOW_MISSING === 'true';
const envName = env.VITE_ENV || env.NODE_ENV || 'staging';
const isProductionLike = ['staging', 'preview', 'production'].includes(envName);

const groups = [
  {
    label: 'Public runtime',
    names: [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_GEMINI_PROXY_URL',
      'VITE_SENTRY_DSN',
    ],
  },
  {
    label: 'Server Supabase',
    names: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
  },
  {
    label: 'Deployed smoke',
    names: ['STAGING_APP_URL', 'SUPABASE_TEST_ACCESS_TOKEN'],
  },
  {
    label: 'Stripe sandbox',
    names: [
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'STRIPE_PRICE_PRO_MONTHLY',
      'STRIPE_PRICE_PRO_YEARLY',
      'STRIPE_PRICE_COACH_MONTHLY',
      'STRIPE_PRICE_COACH_YEARLY',
      'STRIPE_PRICE_ELITE_MONTHLY',
      'STRIPE_PRICE_ELITE_YEARLY',
    ],
  },
  {
    label: 'Gemini',
    names: ['GEMINI_API_KEY'],
  },
  {
    label: 'Sentry release',
    names: [
      'SENTRY_AUTH_TOKEN',
      'SENTRY_ORG',
      'SENTRY_PROJECT',
      'SENTRY_RELEASE',
      'SENTRY_DEPLOY_ENV',
    ],
  },
  {
    label: 'Origin allowlist',
    names: ['APP_URL', 'CORS_ALLOWED_ORIGINS', 'OAUTH_REDIRECT_ALLOWED_ORIGINS'],
  },
  {
    label: 'Scheduled worker secrets',
    names: ['CRON_SECRET', 'RETENTION_WORKER_SECRET'],
  },
];

const allowedPublicEnv = new Set([
  'VITE_ENV',
  'VITE_FEATURE_AUDIENCE',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_GEMINI_PROXY_URL',
  'VITE_SENTRY_DSN',
  'VITE_SENTRY_RELEASE',
  'VITE_POSTHOG_KEY',
  'VITE_POSTHOG_HOST',
]);

function recordMissing(label, names) {
  const missing = names.filter((name) => !env[name]);
  if (missing.length === 0) {
    passes.push(`${label}: ${names.length} envs set`);
    return;
  }

  const message = `${label}: missing ${missing.join(', ')}`;
  if (allowMissing) warnings.push(message);
  else failures.push(message);
}

function isPlaceholderValue(value) {
  return (
    value === 'change_me' ||
    value.startsWith('__REQUIRED') ||
    value.startsWith('SUA_') ||
    value.startsWith('MY_') ||
    value.includes('SEU-PROJETO')
  );
}

function validateRequiredValues() {
  const requiredNames = groups.flatMap((group) => group.names);

  for (const name of requiredNames) {
    const value = env[name];
    if (!value) continue;

    if (isPlaceholderValue(value)) {
      failures.push(`${name}: placeholder value is not allowed`);
    }
  }

  for (const name of ['CRON_SECRET', 'RETENTION_WORKER_SECRET']) {
    const value = env[name] || '';
    if (value && value.length < 16) failures.push(`${name}: must be at least 16 chars`);
  }

  passes.push('Required env placeholder values checked');
}

function validateSupabaseConsistency() {
  const publicUrl = env.VITE_SUPABASE_URL;
  const serverUrl = env.SUPABASE_URL;

  if (!publicUrl || !serverUrl) return;

  try {
    const publicOrigin = new URL(publicUrl).origin;
    const serverOrigin = new URL(serverUrl).origin;

    if (publicOrigin !== serverOrigin) {
      failures.push('SUPABASE_URL must match VITE_SUPABASE_URL origin');
    } else {
      passes.push('Supabase public/server URL consistency checked');
    }
  } catch {
    failures.push('SUPABASE_URL/VITE_SUPABASE_URL: invalid URL');
  }
}

function parseOrigins(name) {
  return (env[name] || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function validateOrigins() {
  const originNames = [
    'APP_URL',
    'CORS_ALLOWED_ORIGINS',
    'API_ALLOWED_ORIGINS',
    'TELEMETRY_ALLOWED_ORIGINS',
    'OAUTH_REDIRECT_ALLOWED_ORIGINS',
  ];

  for (const name of originNames) {
    const origins = parseOrigins(name);
    if (origins.includes('*')) failures.push(`${name}: wildcard origin is not allowed`);

    for (const origin of origins) {
      let url;
      try {
        url = new URL(origin);
      } catch {
        failures.push(`${name}: invalid origin ${origin}`);
        continue;
      }

      const isLocal = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
      if (isProductionLike && isLocal)
        failures.push(`${name}: localhost is not allowed for ${envName}`);
      if (isProductionLike && url.protocol !== 'https:')
        failures.push(`${name}: ${origin} must use https for ${envName}`);
    }
  }

  passes.push('Origin allowlists checked');
}

function validateOauthMode() {
  const mode = env.OAUTH_TOKEN_SECURITY_MODE;
  if (!mode) {
    failures.push('OAUTH_TOKEN_SECURITY_MODE: missing');
    return;
  }

  if (!['encrypted', 'plaintext_blocked'].includes(mode)) {
    failures.push('OAUTH_TOKEN_SECURITY_MODE: expected encrypted or plaintext_blocked');
    return;
  }

  if (mode === 'encrypted') {
    const key = env.HEALTH_OAUTH_TOKEN_ENCRYPTION_KEY;
    if (!key) {
      failures.push(
        'HEALTH_OAUTH_TOKEN_ENCRYPTION_KEY: required when OAUTH_TOKEN_SECURITY_MODE=encrypted',
      );
      return;
    }

    if (isPlaceholderValue(key)) {
      failures.push('HEALTH_OAUTH_TOKEN_ENCRYPTION_KEY: placeholder value is not allowed');
      return;
    }

    try {
      if (Buffer.from(key, 'base64').length !== 32) {
        failures.push('HEALTH_OAUTH_TOKEN_ENCRYPTION_KEY: must be base64 for exactly 32 bytes');
      }
    } catch {
      failures.push('HEALTH_OAUTH_TOKEN_ENCRYPTION_KEY: invalid base64');
    }
  }

  if (mode === 'plaintext_blocked') {
    warnings.push(
      'OAuth token storage is plaintext_blocked; external health OAuth flows must remain disabled',
    );
  }

  passes.push('OAuth token security mode checked');
}

function validatePublicSecrets() {
  const forbiddenPublicNames = Object.keys(env).filter((name) => {
    if (!name.startsWith('VITE_')) return false;
    if (allowedPublicEnv.has(name)) return false;
    return /(SECRET|SERVICE_ROLE|GEMINI_API_KEY|STRIPE|WEBHOOK|AUTH_TOKEN|ACCESS_TOKEN|OAUTH|ENCRYPTION|DB_URL)/i.test(
      name,
    );
  });

  if (forbiddenPublicNames.length) {
    failures.push(
      `Public env exposes server-side secret names: ${forbiddenPublicNames.join(', ')}`,
    );
  } else {
    passes.push('No forbidden VITE_* secret names found in current env');
  }

  const example = readFileSync('.env.example', 'utf8');
  const forbiddenExamplePattern =
    /^VITE_.*(SECRET|SERVICE_ROLE|GEMINI_API_KEY|STRIPE|WEBHOOK|AUTH_TOKEN|ACCESS_TOKEN|OAUTH|ENCRYPTION|DB_URL)/im;
  if (forbiddenExamplePattern.test(example)) {
    failures.push('.env.example contains forbidden VITE_* secret-like key');
  } else {
    passes.push('.env.example public/server env split checked');
  }
}

for (const group of groups) recordMissing(group.label, group.names);
validateRequiredValues();
validateSupabaseConsistency();
validateOrigins();
validateOauthMode();
validatePublicSecrets();

for (const pass of passes) console.log(`PASS ${pass}`);
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const failure of failures) console.error(`FAIL ${failure}`);

if (failures.length) {
  console.error(`FAIL sprint3 preflight found ${failures.length} blocking issue(s)`);
  process.exitCode = 1;
} else {
  console.log('PASS sprint3 preflight');
}
