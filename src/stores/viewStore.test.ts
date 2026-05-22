import { describe, it, expect, beforeEach } from 'vitest';
import { useViewStore } from './viewStore';
import { VIEWS } from '../navigation/views';

// Capture initial state to reset between tests
const initialState = useViewStore.getState();

describe('viewStore', () => {
  beforeEach(() => {
    // Reset to pristine state to prevent tests bleeding into each other
    useViewStore.setState(initialState, true);
  });

  it('has expected initial state', () => {
    const state = useViewStore.getState();
    expect(state.initialized).toBe(false);
    expect(state.view).toBe(VIEWS.LOADING);
  });

  it('initializes view correctly if not previously initialized', () => {
    const state = useViewStore.getState();
    
    // Act
    state.initializeView(VIEWS.DASHBOARD);
    
    // Assert
    const updatedState = useViewStore.getState();
    expect(updatedState.initialized).toBe(true);
    expect(updatedState.view).toBe(VIEWS.DASHBOARD);
  });

  it('ignores initializeView if already initialized', () => {
    // Setup
    useViewStore.getState().initializeView(VIEWS.DASHBOARD);
    
    // Act (attempt to re-initialize with different view)
    useViewStore.getState().initializeView(VIEWS.SETTINGS);
    
    // Assert
    const updatedState = useViewStore.getState();
    expect(updatedState.view).toBe(VIEWS.DASHBOARD); // Should remain DASHBOARD
  });

  it('forces a view change via setView regardless of initialization state', () => {
    // Act
    useViewStore.getState().setView(VIEWS.SETTINGS);
    
    // Assert
    const updatedState = useViewStore.getState();
    expect(updatedState.initialized).toBe(true);
    expect(updatedState.view).toBe(VIEWS.SETTINGS);
  });
});
