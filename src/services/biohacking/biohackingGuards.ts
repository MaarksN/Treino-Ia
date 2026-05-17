export interface FlirThermographyCapability {
  isHardwareAvailable: boolean;
  status: 'blocked_external_dependency' | 'ready';
  lastReading: null;
}

export const getFlirCapability = (): FlirThermographyCapability => {
  return {
    isHardwareAvailable: false,
    status: 'blocked_external_dependency',
    lastReading: null,
  };
};

export interface HrvCapability {
  isHardwareAvailable: boolean;
  status: 'blocked_external_dependency' | 'ready';
  isResearchGuardActive: boolean;
  lastReading: null;
}

export const getHrvCapability = (): HrvCapability => {
  return {
    isHardwareAvailable: false,
    status: 'blocked_external_dependency',
    isResearchGuardActive: true,
    lastReading: null,
  };
};
