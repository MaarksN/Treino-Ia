export type DataSensitivity = 'public' | 'low' | 'personal' | 'sensitive_health' | 'sensitive_image' | 'credential' | 'unknown';
export type LocalStorageDecision = 'allow' | 'allow_with_ttl' | 'deny' | 'deny_backend_required' | 'redact_before_store';

const IMAGE_PATTERN = /^data:image\/[a-z0-9.+-]+;base64,/i;

export function classifyDataSensitivity(key: string, value: unknown): DataSensitivity {
  const normalized = key.toLowerCase();
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  if (/token|authorization|password|apikey|secret|refresh_token|access_token/.test(normalized)) return 'credential';
  if (IMAGE_PATTERN.test(text) || /photo|image|base64/.test(normalized)) return 'sensitive_image';
  if (/body|health|symptom|sleep|food|meal|injury|hydration|nutrition/.test(normalized)) return 'sensitive_health';
  if (/name|profile|email|phone/.test(normalized)) return 'personal';
  if (/theme|ui|setting/.test(normalized)) return 'low';
  return 'unknown';
}

export function decideLocalStoragePolicy(sensitivity: DataSensitivity): { decision: LocalStorageDecision; message: string } {
  if (sensitivity === 'credential') return { decision: 'deny', message: 'Credenciais/tokens não podem ser persistidos no localStorage.' };
  if (sensitivity === 'sensitive_image') return { decision: 'deny_backend_required', message: 'Imagens base64 sensíveis devem ir para backend seguro; bloqueado no armazenamento local.' };
  if (sensitivity === 'sensitive_health') return { decision: 'allow_with_ttl', message: 'Dados de saúde exigem consentimento e retenção curta (TTL) em armazenamento local.' };
  if (sensitivity === 'personal') return { decision: 'redact_before_store', message: 'Dados pessoais devem ser minimizados/redigidos antes de persistir localmente.' };
  if (sensitivity === 'low' || sensitivity === 'public') return { decision: 'allow', message: 'Dados de baixa sensibilidade permitidos em localStorage.' };
  return { decision: 'allow_with_ttl', message: 'Sensibilidade desconhecida: aplicar TTL e revisão antes de persistir.' };
}
