/**
 * Item 67 — WebXR Capability Service
 *
 * Detects WebXR/immersive-ar support without faking AR.
 * Does NOT start XR sessions or install libraries.
 */

export type XRAvailability = 'supported' | 'unsupported' | 'unknown';

export interface WebXRCapabilityStatus {
  apiPresent: boolean;
  immersiveArSupported: XRAvailability;
  reason: string;
}

type NavigatorWithXR = Navigator & {
  xr?: { isSessionSupported?: (mode: string) => Promise<boolean> };
};

export function isWebXRApiPresent(): boolean {
  if (typeof navigator === 'undefined') return false;
  return Boolean((navigator as NavigatorWithXR).xr);
}

export async function checkImmersiveArSupport(): Promise<XRAvailability> {
  if (typeof navigator === 'undefined') return 'unsupported';
  const xr = (navigator as NavigatorWithXR).xr;
  if (!xr?.isSessionSupported) return 'unsupported';
  try {
    const supported = await xr.isSessionSupported('immersive-ar');
    return supported ? 'supported' : 'unsupported';
  } catch {
    return 'unknown';
  }
}

export function getWebXRCapabilitySync(): WebXRCapabilityStatus {
  const apiPresent = isWebXRApiPresent();
  return {
    apiPresent,
    immersiveArSupported: apiPresent ? 'unknown' : 'unsupported',
    reason: apiPresent
      ? 'API WebXR detectada. Verificação de immersive-ar requer teste assíncrono.'
      : 'API WebXR não disponível neste navegador.',
  };
}

export const WEBXR_DISCLAIMER =
  'WebXR/AR é uma tecnologia experimental que depende de hardware e navegador compatíveis. Nenhuma sessão AR é iniciada sem verificação de suporte e consentimento do usuário. Este painel é apenas um detector de capabilities.';
