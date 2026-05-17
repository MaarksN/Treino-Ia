export type DashboardSectionId = 'overview' | 'nutrition' | 'plan' | 'history' | 'reports';

export interface DashboardSection {
  id: DashboardSectionId;
  label: string;
  icon: 'home' | 'nutrition' | 'workout' | 'history' | 'report';
  targetId: string;
}

export const DASHBOARD_MOBILE_SECTIONS: DashboardSection[] = [
  { id: 'overview', label: 'Inicio', icon: 'home', targetId: 'dashboard-overview' },
  { id: 'nutrition', label: 'Nutri', icon: 'nutrition', targetId: 'dashboard-nutrition' },
  { id: 'plan', label: 'Plano', icon: 'workout', targetId: 'dashboard-plan' },
  { id: 'history', label: 'Historico', icon: 'history', targetId: 'dashboard-history' },
  { id: 'reports', label: 'Relatorio', icon: 'report', targetId: 'dashboard-reports' },
];

export function getDashboardMobileSections(hasTrainingData: boolean) {
  return hasTrainingData
    ? DASHBOARD_MOBILE_SECTIONS
    : DASHBOARD_MOBILE_SECTIONS.slice(0, 1);
}

export function getDashboardSectionByTarget(targetId: string) {
  return DASHBOARD_MOBILE_SECTIONS.find(section => section.targetId === targetId) ?? DASHBOARD_MOBILE_SECTIONS[0];
}
