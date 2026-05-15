export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unexpected error.';
}

export function toSafeUserMessage(error: unknown): string {
  return 'Não foi possível concluir a ação agora. Tente novamente.';
}
