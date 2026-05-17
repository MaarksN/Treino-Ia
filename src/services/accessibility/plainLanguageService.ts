/**
 * Item 95 — Plain Language Service
 *
 * Translates technical fitness terms into simple, accessible language.
 * Does NOT alter medical content into absolute claims.
 */

export interface GlossaryEntry {
  term: string;
  technical: string;
  plain: string;
}

const GLOSSARY: GlossaryEntry[] = [
  { term: 'RPE', technical: 'Rating of Perceived Exertion — escala subjetiva de esforço.', plain: 'Uma nota de 1 a 10 para dizer o quanto o exercício foi difícil para você.' },
  { term: 'Volume', technical: 'Tonelagem total: séries × repetições × carga.', plain: 'A quantidade total de peso que você levantou no treino.' },
  { term: 'Deload', technical: 'Semana de redução planejada de carga para recuperação.', plain: 'Uma semana mais leve para seu corpo se recuperar e voltar mais forte.' },
  { term: 'Superset', technical: 'Dois exercícios executados em sequência sem descanso.', plain: 'Fazer dois exercícios seguidos, sem parar entre eles.' },
  { term: 'Dropset', technical: 'Séries com redução progressiva de carga sem descanso.', plain: 'Reduzir o peso e continuar o exercício sem parar, até cansar.' },
  { term: 'DOMS', technical: 'Delayed Onset Muscle Soreness — dor muscular tardia.', plain: 'A dor muscular que aparece 1-2 dias depois do treino. É normal.' },
  { term: 'Platô', technical: 'Estagnação de desempenho sem progressão por período prolongado.', plain: 'Quando você para de melhorar depois de treinar por um tempo.' },
  { term: 'Periodização', technical: 'Divisão planejada de fases de treino (acumulação, intensificação, pico).', plain: 'Organizar o treino em fases para melhorar aos poucos.' },
  { term: 'Anamnese', technical: 'Questionário de avaliação do perfil de treino e saúde.', plain: 'Um formulário sobre você para o app personalizar seu treino.' },
  { term: 'Hipertrofia', technical: 'Aumento do volume das fibras musculares.', plain: 'Crescimento dos músculos por causa do treino.' },
  { term: 'Recuperação', technical: 'Fase de adaptação fisiológica entre sessões de treino.', plain: 'O tempo que seu corpo precisa para se reparar depois de treinar.' },
  { term: 'Macrociclo', technical: 'Planejamento de longo prazo (meses) da periodização.', plain: 'O plano geral de treino para vários meses.' },
  { term: 'Microciclo', technical: 'Planejamento de curto prazo (geralmente uma semana).', plain: 'O plano de treino para uma semana.' },
  { term: 'Cadência', technical: 'Velocidade de execução de cada fase do movimento.', plain: 'O quão devagar ou rápido você faz cada parte do exercício.' },
  { term: 'Streak', technical: 'Sequência consecutiva de dias com treino registrado.', plain: 'Quantos dias seguidos você treinou sem faltar.' },
];

const STORAGE_KEY = '@TreinoIA:accessibility:plainLanguage';

export function isPlainLanguageEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setPlainLanguageEnabled(enabled: boolean): boolean {
  const safeEnabled = Boolean(enabled);
  localStorage.setItem(STORAGE_KEY, String(safeEnabled));
  return safeEnabled;
}

export function togglePlainLanguage(): boolean {
  return setPlainLanguageEnabled(!isPlainLanguageEnabled());
}

export function getGlossary(): GlossaryEntry[] {
  return [...GLOSSARY];
}

export function lookupTerm(term: string): GlossaryEntry | null {
  const normalized = term.trim().toLowerCase();
  return GLOSSARY.find(entry => entry.term.toLowerCase() === normalized) ?? null;
}

export function getExplanation(term: string, usePlain: boolean): string {
  const entry = lookupTerm(term);
  if (!entry) return '';
  return usePlain ? entry.plain : entry.technical;
}

export function simplifyText(text: string, usePlain: boolean): string {
  if (!usePlain) return text;
  let result = text;
  for (const entry of GLOSSARY) {
    const regex = new RegExp(`\\b${entry.term}\\b`, 'gi');
    result = result.replace(regex, `${entry.term} (${entry.plain})`);
  }
  return result;
}
