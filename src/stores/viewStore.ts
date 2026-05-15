import { create } from 'zustand';
import { VIEWS, type AppView } from '../navigation/views';

interface ViewStoreState {
  initialized: boolean;
  view: AppView;
  initializeView: (view: AppView) => void;
  setView: (view: AppView) => void;
}

export const useViewStore = create<ViewStoreState>(set => ({
  initialized: false,
  view: VIEWS.LOADING,
  initializeView: view =>
    set(state => {
      if (state.initialized) return state;
      return { initialized: true, view };
    }),
  setView: view => set({ initialized: true, view }),
}));
