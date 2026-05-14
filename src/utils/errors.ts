export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unexpected error.';
}

export function toSafeUserMessage(error: unknown): string {
  // In a real scenario, we might want to map certain error messages to more user-friendly messages.
  // For now, we return a safe default to not leak internal errors.
  return 'Não foi possível concluir a ação agora. Tente novamente.';
}
