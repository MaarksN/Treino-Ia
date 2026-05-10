export function sanitizeText(value: string) {
  return value
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, 2000);
}

export function sanitizeEmail(value: string) {
  return sanitizeText(value).toLowerCase();
}
