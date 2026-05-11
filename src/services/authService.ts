import { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { sanitizeEmail, sanitizeText } from '../utils/inputSanitizer';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export interface SupabaseAuthCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface SupabaseAuthUser {
  id: string;
  email: string;
  name: string;
}

function assertAuthConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase Auth não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
  }
}

function validatePassword(password: string): string {
  if (password.length < 8) {
    throw new Error('Senha deve ter pelo menos 8 caracteres.');
  }

  return password;
}

function toAuthUser(user: SupabaseUser): SupabaseAuthUser {
  return {
    id: user.id,
    email: user.email ?? '',
    name: sanitizeText(String(user.user_metadata?.name || user.email?.split('@')[0] || 'Atleta')),
  };
}

export async function signUpWithEmail(credentials: SupabaseAuthCredentials): Promise<SupabaseAuthUser | null> {
  assertAuthConfigured();

  const email = sanitizeEmail(credentials.email);
  const password = validatePassword(credentials.password);
  const name = sanitizeText(credentials.name || email.split('@')[0] || 'Atleta');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) throw new Error(error.message);
  return data.user ? toAuthUser(data.user) : null;
}

export async function signInWithEmail(email: string, password: string): Promise<SupabaseAuthUser> {
  assertAuthConfigured();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: sanitizeEmail(email),
    password: validatePassword(password),
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Supabase Auth não retornou usuário.');

  return toAuthUser(data.user);
}

export async function signOut(): Promise<void> {
  assertAuthConfigured();

  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getCurrentAuthUser(): Promise<SupabaseAuthUser | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  return toAuthUser(data.user);
}

export async function getCurrentSession(): Promise<Session | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);

  return data.session;
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): () => void {
  if (!isSupabaseConfigured) return () => {};

  const { data } = supabase.auth.onAuthStateChange(callback);
  return () => data.subscription.unsubscribe();
}

export const getLocalAuthUser = getCurrentAuthUser;
