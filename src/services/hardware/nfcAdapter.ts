/**
 * Item 66: NFC Tap-to-Set
 * Adapter and guard to activate Web NFC securely if available.
 */
import { useState, useEffect } from 'react';

export function useNfcCapability() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    // Check if NDEFReader exists in the global window object for Web NFC
    if ('NDEFReader' in window) {
      setIsSupported(true);
      // We assume it's ready if supported, though actual reading requires user gesture
      setIsReady(true);
    } else {
      setIsSupported(false);
      setIsReady(false);
    }
  }, []);

  return { isSupported, isReady, feature: 'NFC Tap-to-Set' };
}
