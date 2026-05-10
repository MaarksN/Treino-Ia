export type SupportedLocale = 'pt-BR' | 'en-US' | 'es';

const DICTIONARY: Record<SupportedLocale, Record<string, string>> = {
  'pt-BR': {
    platform: 'Plataforma',
    billing: 'Monetizacao',
    nutrition: 'Nutricao',
    security: 'Seguranca',
  },
  'en-US': {
    platform: 'Platform',
    billing: 'Monetization',
    nutrition: 'Nutrition',
    security: 'Security',
  },
  es: {
    platform: 'Plataforma',
    billing: 'Monetizacion',
    nutrition: 'Nutricion',
    security: 'Seguridad',
  },
};

export function t(locale: SupportedLocale, key: string) {
  return DICTIONARY[locale]?.[key] ?? DICTIONARY['pt-BR'][key] ?? key;
}
