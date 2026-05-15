const DEFAULT_ERROR_MESSAGE = 'Erro inesperado.';

type ErrorLike = {
  message?: unknown;
};

export function getErrorMessage(error: unknown, fallback = DEFAULT_ERROR_MESSAGE): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (error && typeof error === 'object') {
    const message = (error as ErrorLike).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
}

export function toError(error: unknown, fallback = DEFAULT_ERROR_MESSAGE): Error {
  if (error instanceof Error && error.message.trim()) {
    return error;
  }

  return new Error(getErrorMessage(error, fallback), { cause: error });
}
