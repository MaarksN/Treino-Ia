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
};

const schema = z.object({
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  VITE_ENV: z.string().optional(),
  MODE: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  VITE_GEMINI_PROXY_URL: z.string().url().optional(),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_POSTHOG_KEY: z.string().optional(),
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
