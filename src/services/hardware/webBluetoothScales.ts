/**
 * Item 69: Balanças via Web Bluetooth
 * Capability guard; no fake connections.
 */
import { useState, useEffect } from 'react';

export function useBluetoothCapability() {
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    // Detect Web Bluetooth API
    const nav = navigator as any;
    if (nav.bluetooth && typeof nav.bluetooth.requestDevice === 'function') {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  return { isSupported, feature: 'Balança via Web Bluetooth' };
}
