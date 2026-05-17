/**
 * Item 67: AR/WebXR
 * Capability detection for WebXR; avoid rendering fake HUDs.
 */
import { useState, useEffect } from 'react';

export function useWebXrCapability() {
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    // Check if WebXR is available
    const nav = navigator as any;
    if (nav.xr && nav.xr.isSessionSupported) {
      nav.xr.isSessionSupported('immersive-ar').then((supported: boolean) => {
        setIsSupported(supported);
      }).catch(() => {
        setIsSupported(false);
      });
    } else {
      setIsSupported(false);
    }
  }, []);

  return { isSupported, feature: 'AR/WebXR HUD' };
}
