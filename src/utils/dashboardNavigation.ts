import type { AppRouteId } from '../navigation/appRouter';

export type DashboardSectionId = 'overview' | 'plan' | 'history' | 'account' | 'nutrition';

export interface DashboardSection {
  id: DashboardSectionId;
  label: string;
  icon: 'home' | 'nutrition' | 'workout' | 'history' | 'profile';
  targetId: string;
  routeId: AppRouteId;
}

export const DASHBOARD_MOBILE_SECTIONS: DashboardSection[] = [
  {
    id: 'overview',
    label: 'Início',
    icon: 'home',
    targetId: 'dashboard-overview',
    routeId: 'today',
  },
  { id: 'plan', label: 'Plano', icon: 'workout', targetId: 'dashboard-plan', routeId: 'plan' },
  {
    id: 'history',
    label: 'Histórico',
    icon: 'history',
    targetId: 'dashboard-history',
    routeId: 'history',
  },
  {
    id: 'account',
    label: 'Conta',
    icon: 'profile',
    targetId: 'dashboard-account',
    routeId: 'account',
  },
];

const NUTRITION_SECTION: DashboardSection = {
  id: 'nutrition',
  label: 'Nutri',
  icon: 'nutrition',
  targetId: 'dashboard-nutrition',
  routeId: 'nutrition',
};

export function getDashboardMobileSections(
  hasTrainingData: boolean,
  options: { nutritionEnabled?: boolean } = {},
) {
  if (!hasTrainingData) return DASHBOARD_MOBILE_SECTIONS.slice(0, 1);
  if (!options.nutritionEnabled) return DASHBOARD_MOBILE_SECTIONS;

  return [DASHBOARD_MOBILE_SECTIONS[0], NUTRITION_SECTION, ...DASHBOARD_MOBILE_SECTIONS.slice(1)];
}

export function getDashboardSectionByTarget(targetId: string) {
  return (
    [...DASHBOARD_MOBILE_SECTIONS, NUTRITION_SECTION].find(
      (section) => section.targetId === targetId,
    ) ?? DASHBOARD_MOBILE_SECTIONS[0]
  );
}
