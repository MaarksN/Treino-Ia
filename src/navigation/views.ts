export const VIEWS = {
  LOADING: 'loading',
  REGISTRATION: 'registration',
  HOME: 'home',
  DASHBOARD: 'dashboard',
  SOCIAL: 'social',
  PUBLIC_PROFILE: 'public_profile',
} as const;

export type AppView = (typeof VIEWS)[keyof typeof VIEWS];
export type ViewState = AppView;
