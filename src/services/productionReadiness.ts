export type ProductionReadinessStatus = 'pass' | 'blocked' | 'manual';

export interface ProductionReadinessCheck {
  id: string;
  label: string;
  area: 'env' | 'staging' | 'security' | 'billing' | 'ai' | 'database' | 'operations';
  status: ProductionReadinessStatus;
  evidence: string;
  nextAction: string;
}

export interface ProductionReadinessSummary {
  verdict: 'go' | 'no_go';
  passCount: number;
  blockedCount: number;
  manualCount: number;
  totalCount: number;
  checks: ProductionReadinessCheck[];
}

export interface ProductionReadinessEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_GEMINI_PROXY_URL?: string;
  VITE_SENTRY_DSN?: string;
  VITE_STAGING_APP_URL?: string;
}

const PUBLIC_ENV_CHECKS: Array<{
  id: string;
  label: string;
  key: keyof ProductionReadinessEnv;
  area: ProductionReadinessCheck['area'];
  nextAction: string;
}> = [
  {
    id: 'public-supabase-url',
    label: 'Supabase URL publica configurada',
    key: 'VITE_SUPABASE_URL',
    area: 'env',
    nextAction: 'Definir VITE_SUPABASE_URL no preview/staging.',
  },
  {
    id: 'public-supabase-anon-key',
    label: 'Supabase anon key publica configurada',
    key: 'VITE_SUPABASE_ANON_KEY',
    area: 'env',
    nextAction: 'Definir VITE_SUPABASE_ANON_KEY no preview/staging.',
  },
  {
    id: 'gemini-proxy-url',
    label: 'Proxy Gemini publico configurado',
    key: 'VITE_GEMINI_PROXY_URL',
    area: 'ai',
    nextAction: 'Publicar o proxy /api/gemini-proxy e configurar VITE_GEMINI_PROXY_URL.',
  },
  {
    id: 'sentry-dsn',
    label: 'Sentry DSN publico configurado',
    key: 'VITE_SENTRY_DSN',
    area: 'operations',
    nextAction: 'Configurar VITE_SENTRY_DSN e validar release/sourcemaps.',
  },
  {
    id: 'staging-url',
    label: 'URL de staging informada',
    key: 'VITE_STAGING_APP_URL',
    area: 'staging',
    nextAction: 'Definir VITE_STAGING_APP_URL para registrar evidencia de smoke real.',
  },
];

const MANUAL_CHECKS: ProductionReadinessCheck[] = [
  {
    id: 'server-secrets',
    label: 'Secrets server-side provisionados fora do repositorio',
    area: 'env',
    status: 'manual',
    evidence:
      'SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, GEMINI_API_KEY e Sentry tokens nao sao legiveis no cliente.',
    nextAction: 'Rodar npm run preflight:sprint3 em shell/CI seguro com secrets reais.',
  },
  {
    id: 'staging-smoke',
    label: 'Smoke sprint3 passou em staging estrito',
    area: 'staging',
    status: 'manual',
    evidence: 'Requer STAGING_APP_URL e SUPABASE_TEST_ACCESS_TOKEN reais.',
    nextAction: 'Executar SPRINT3_SMOKE_STRICT=true npm run smoke:sprint3.',
  },
  {
    id: 'tenant-ab',
    label: 'Isolamento A/B validado dinamicamente',
    area: 'security',
    status: 'manual',
    evidence: 'Requer tokens reais de dois usuarios/tenants em staging.',
    nextAction:
      'Executar npm run smoke:tenant-ab com TENANT_A_ACCESS_TOKEN e TENANT_B_ACCESS_TOKEN.',
  },
  {
    id: 'stripe-sandbox',
    label: 'Billing Stripe sandbox validado',
    area: 'billing',
    status: 'manual',
    evidence: 'Checkout, portal e webhook assinado dependem de Stripe sandbox real.',
    nextAction: 'Executar smoke de billing com webhook secret e price IDs sandbox.',
  },
  {
    id: 'gemini-real',
    label: 'Gemini proxy validado com chave real',
    area: 'ai',
    status: 'manual',
    evidence: 'O cliente so conhece a URL do proxy; a chave real precisa ficar server-side.',
    nextAction: 'Validar auth, entitlement, rate limit e resposta real do proxy.',
  },
  {
    id: 'database-migrations',
    label: 'Migrations aplicadas em banco limpo',
    area: 'database',
    status: 'manual',
    evidence: 'A auditoria local nao aplicou migrations em Supabase remoto limpo.',
    nextAction:
      'Aplicar migrations, rodar npm run schema:drift e registrar supabase migration list.',
  },
  {
    id: 'backup-restore',
    label: 'Backup/restore ensaiado',
    area: 'operations',
    status: 'manual',
    evidence: 'Runbook existe, mas ensaio real depende do ambiente de staging.',
    nextAction: 'Executar o runbook de disaster recovery e anexar evidencia.',
  },
  {
    id: 'compliance-real',
    label: 'Exportacao/exclusao LGPD validada com usuario real',
    area: 'security',
    status: 'manual',
    evidence: 'Compliance real exige token de staging e opt-in destrutivo para erasure.',
    nextAction: 'Executar npm run smoke:compliance com usuario de staging descartavel.',
  },
];

function hasValue(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function buildProductionReadinessSummary(
  env?: ProductionReadinessEnv,
): ProductionReadinessSummary {
  const runtimeEnv = env ?? (import.meta.env as unknown as ProductionReadinessEnv);
  const publicChecks: ProductionReadinessCheck[] = PUBLIC_ENV_CHECKS.map((check) => {
    const configured = hasValue(runtimeEnv[check.key]);

    return {
      id: check.id,
      label: check.label,
      area: check.area,
      status: configured ? 'pass' : 'blocked',
      evidence: configured
        ? `${check.key} presente no runtime publico.`
        : `${check.key} ausente no runtime publico.`,
      nextAction: configured
        ? 'Manter configurado no ambiente de staging/producao.'
        : check.nextAction,
    };
  });

  const checks = [...publicChecks, ...MANUAL_CHECKS];
  const passCount = checks.filter((check) => check.status === 'pass').length;
  const blockedCount = checks.filter((check) => check.status === 'blocked').length;
  const manualCount = checks.filter((check) => check.status === 'manual').length;

  return {
    verdict: blockedCount === 0 && manualCount === 0 ? 'go' : 'no_go',
    passCount,
    blockedCount,
    manualCount,
    totalCount: checks.length,
    checks,
  };
}
