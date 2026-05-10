import { sanitizeEmail, sanitizeText } from '../utils/inputSanitizer';
import { logAuditEvent } from './auditLogService';

export interface LocalAuthUser {
  id: string;
  email: string;
  name: string;
}

const AUTH_KEY = '@TreinoApp:auth-user';

export function signInWithEmail(email: string, password: string): LocalAuthUser {
  if (password.length < 8) {
    throw new Error('Senha deve ter pelo menos 8 caracteres.');
  }

  const user = {
    id: crypto.randomUUID(),
    email: sanitizeEmail(email),
    name: sanitizeText(email.split('@')[0] || 'Atleta'),
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  logAuditEvent('auth.sign_in', `Login local para ${user.email}.`, user.email);
  return user;
}

export function getLocalAuthUser(): LocalAuthUser | null {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null') as LocalAuthUser | null;
  } catch {
    return null;
  }
}
