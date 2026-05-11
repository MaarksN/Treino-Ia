import { PoseAnalysis } from '../types';

const POSE_KEY = '@TreinoApp:poseAnalyses';

export function loadPoseAnalyses(): PoseAnalysis[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(POSE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePoseAnalysis(analysis: PoseAnalysis) {
  const all = loadPoseAnalyses();
  all.push(analysis);
  localStorage.setItem(POSE_KEY, JSON.stringify(all.slice(-50)));
}

export function calcAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return Math.round(angle);
}

export type ExerciseRule = {
  name: string;
  keyAngles: Array<{
    label: string;
    landmarkIndices: [number, number, number];
    goodRange: [number, number];
    issue: string;
    tip: string;
  }>;
};

export const EXERCISE_RULES: ExerciseRule[] = [
  {
    name: 'Agachamento',
    keyAngles: [
      {
        label: 'Joelho',
        landmarkIndices: [24, 26, 28],
        goodRange: [70, 110],
        issue: 'Profundidade insuficiente ou joelho passando demais do pé',
        tip: 'Desça até a coxa ficar paralela ao solo. Mantenha joelho alinhado ao pé.',
      },
      {
        label: 'Coluna',
        landmarkIndices: [12, 24, 26],
        goodRange: [160, 180],
        issue: 'Coluna curvada para frente',
        tip: 'Mantenha o peito alto, olhar à frente e core ativo.',
      },
    ],
  },
  {
    name: 'Barra Fixa',
    keyAngles: [
      {
        label: 'Cotovelo na subida',
        landmarkIndices: [12, 14, 16],
        goodRange: [30, 70],
        issue: 'Amplitude insuficiente: cotovelo não fechou',
        tip: 'Puxe até o queixo ultrapassar a barra, com cotovelo bem fechado.',
      },
    ],
  },
  {
    name: 'Supino',
    keyAngles: [
      {
        label: 'Cotovelo na descida',
        landmarkIndices: [12, 14, 16],
        goodRange: [80, 100],
        issue: 'Cotovelos muito abertos ou muito fechados',
        tip: 'Mantenha cotovelos a 45-75 graus do tronco. Barra desce ao esterno.',
      },
    ],
  },
  {
    name: 'Levantamento Terra',
    keyAngles: [
      {
        label: 'Coluna lombar',
        landmarkIndices: [12, 24, 26],
        goodRange: [150, 180],
        issue: 'Lombar arredondada',
        tip: 'Mantenha coluna neutra e empurre o chão com os pés antes de puxar.',
      },
    ],
  },
];

export function analyzeAngles(
  landmarks: Array<{ x: number; y: number; z?: number; visibility?: number }>,
  rule: ExerciseRule
): { formScore: number; issues: string[]; tips: string[]; keyAngles: Record<string, number> } {
  const issues: string[] = [];
  const tips: string[] = [];
  const keyAngles: Record<string, number> = {};
  let totalScore = 100;

  rule.keyAngles.forEach(check => {
    const [ai, bi, ci] = check.landmarkIndices;
    const a = landmarks[ai];
    const b = landmarks[bi];
    const c = landmarks[ci];
    if (!a || !b || !c) return;

    const angle = calcAngle(a, b, c);
    keyAngles[check.label] = angle;

    const [min, max] = check.goodRange;
    if (angle < min || angle > max) {
      issues.push(check.issue);
      tips.push(check.tip);
      const deviation = Math.min(Math.abs(angle - min), Math.abs(angle - max));
      totalScore -= Math.min(30, deviation);
    }
  });

  return {
    formScore: Math.max(0, Math.round(totalScore)),
    issues,
    tips,
    keyAngles,
  };
}
