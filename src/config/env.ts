export interface PublicEnvStatus {
  key: string;
  configured: boolean;
  required: boolean;
  description: string;
}

export function getPublicEnvStatus(): PublicEnvStatus[] {
  const env = import.meta.env;

  return [
    {
      key: 'GEMINI_API_KEY',
      configured: Boolean(env.GEMINI_API_KEY || env.VITE_GEMINI_PROXY_URL),
      required: true,
      description: 'Usada pelo proxy seguro da IA em producao.',
    },
    {
      key: 'VITE_SUPABASE_URL',
      configured: Boolean(env.VITE_SUPABASE_URL),
      required: true,
      description: 'URL do Supabase para auth, DB e sync.',
    },
    {
      key: 'VITE_SUPABASE_ANON_KEY',
      configured: Boolean(env.VITE_SUPABASE_ANON_KEY),
      required: true,
      description: 'Chave publica anon do Supabase.',
    },
    {
      key: 'VITE_SENTRY_DSN',
      configured: Boolean(env.VITE_SENTRY_DSN),
      required: false,
      description: 'Monitoramento de erros em producao.',
    },
    {
      key: 'VITE_POSTHOG_KEY',
      configured: Boolean(env.VITE_POSTHOG_KEY),
      required: false,
      description: 'Analytics de produto e funis.',
    },
  ];
}
