import { z } from 'zod';

export interface PublicEnvStatus {
  key: string;
  configured: boolean;
  required: boolean;
  description: string;
}

const rawEnv = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_ENV: import.meta.env.VITE_ENV,
  MODE: import.meta.env.MODE,
  GEMINI_API_KEY: import.meta.env.GEMINI_API_KEY,
  VITE_GEMINI_PROXY_URL: import.meta.env.VITE_GEMINI_PROXY_URL,
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  VITE_POSTHOG_KEY: import.meta.env.VITE_POSTHOG_KEY,
  VITE_POSTHOG_HOST: import.meta.env.VITE_POSTHOG_HOST,
};

const optionalEnvString = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(value => (value === '' ? undefined : value), schema.optional());

function isAbsoluteUrlOrRootRelativePath(value: string) {
  if (value.startsWith('/')) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const schema = z.object({
  VITE_SUPABASE_URL: optionalEnvString(z.string().url()),
  VITE_SUPABASE_ANON_KEY: optionalEnvString(z.string().min(1)),
  VITE_ENV: optionalEnvString(z.string()),
  MODE: optionalEnvString(z.string()),
  GEMINI_API_KEY: optionalEnvString(z.string()),
  VITE_GEMINI_PROXY_URL: optionalEnvString(
    z.string().min(1).refine(isAbsoluteUrlOrRootRelativePath, {
      message: 'Must be an absolute http(s) URL or a root-relative path starting with /',
    }),
  ),
  VITE_SENTRY_DSN: optionalEnvString(z.string()),
  VITE_POSTHOG_KEY: optionalEnvString(z.string()),
  VITE_POSTHOG_HOST: optionalEnvString(z.string().url()),
});

const parsed = schema.safeParse(rawEnv);

if (!parsed.success) {
  throw new Error('Invalid environment configuration.');
}

const mode = parsed.data.MODE ?? import.meta.env.MODE;
const appEnv = parsed.data.VITE_ENV ?? mode ?? 'development';
const isProduction = appEnv === 'production' || mode === 'production';

if (isProduction) {
  if (!parsed.data.VITE_SUPABASE_URL || !parsed.data.VITE_SUPABASE_ANON_KEY) {
    throw new Error('Missing required Supabase environment variables in production.');
  }
}

export const env = {
  supabaseUrl: parsed.data.VITE_SUPABASE_URL,
  supabaseAnonKey: parsed.data.VITE_SUPABASE_ANON_KEY,
  geminiApiKey: parsed.data.GEMINI_API_KEY,
  geminiProxyUrl: parsed.data.VITE_GEMINI_PROXY_URL,
  sentryDsn: parsed.data.VITE_SENTRY_DSN,
  posthogKey: parsed.data.VITE_POSTHOG_KEY,
  posthogHost: parsed.data.VITE_POSTHOG_HOST ?? 'https://app.posthog.com',
  appEnv,
  isProduction,
  isDevelopment: !isProduction,
} as const;

export function getPublicEnvStatus(): PublicEnvStatus[] {
  return [
    {
      key: 'GEMINI_API_KEY',
      configured: Boolean(env.geminiApiKey || env.geminiProxyUrl),
      required: true,
      description: 'Usada pelo proxy seguro da IA em producao.',
    },
    {
      key: 'VITE_SUPABASE_URL',
      configured: Boolean(env.supabaseUrl),
      required: true,
      description: 'URL do Supabase para auth, DB e sync.',
    },
    {
      key: 'VITE_SUPABASE_ANON_KEY',
      configured: Boolean(env.supabaseAnonKey),
      required: true,
      description: 'Chave publica anon do Supabase.',
    },
    {
      key: 'VITE_SENTRY_DSN',
      configured: Boolean(env.sentryDsn),
      required: false,
      description: 'Monitoramento de erros em producao.',
    },
    {
      key: 'VITE_POSTHOG_KEY',
      configured: Boolean(env.posthogKey),
      required: false,
      description: 'Analytics de produto e funis.',
    },
  ];
}
