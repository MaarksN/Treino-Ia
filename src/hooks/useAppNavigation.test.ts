import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { VIEWS } from '../navigation/views';
import { useViewStore } from '../stores/viewStore';
import { useAppNavigation } from './useAppNavigation';

const initialViewStoreState = useViewStore.getState();

describe('useAppNavigation', () => {
  beforeEach(() => {
    useViewStore.setState(initialViewStoreState, true);
  });

  it('initializes the view store with the requested initial view', () => {
    const { result } = renderHook(() => useAppNavigation(VIEWS.HOME));

    expect(result.current.view).toBe(VIEWS.HOME);
    expect(useViewStore.getState().initialized).toBe(true);
  });

  it('does not overwrite an already initialized view', () => {
    useViewStore.setState({ initialized: true, view: VIEWS.DASHBOARD }, false);

    const { result } = renderHook(() => useAppNavigation(VIEWS.HOME));

    expect(result.current.view).toBe(VIEWS.DASHBOARD);
  });

  it('navigates through explicit view actions', () => {
    const { result } = renderHook(() => useAppNavigation(VIEWS.LOADING));

    act(() => {
      result.current.goToRegistration();
    });
    expect(result.current.view).toBe(VIEWS.REGISTRATION);

    act(() => {
      result.current.goToDashboard();
    });
    expect(result.current.view).toBe(VIEWS.DASHBOARD);

    act(() => {
      result.current.goToSocial();
    });
    expect(result.current.view).toBe(VIEWS.SOCIAL);

    act(() => {
      result.current.goToPublicProfile();
    });
    expect(result.current.view).toBe(VIEWS.PUBLIC_PROFILE);
  });
});
