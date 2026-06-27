/**
 * Item 66: NFC Tap-to-Set
 * Adapter and guard to activate Web NFC securely if available.
 */
import { useState, useEffect } from 'react';

export function useNfcCapability() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<string | null>(null);

  useEffect(() => {
    // Check if NDEFReader exists in the global window object for Web NFC
    if ('NDEFReader' in window) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  const startScan = async () => {
    if (!isSupported) return;
    setIsReading(true);
    try {
      const nav = window as any;
      const ndef = new nav.NDEFReader();
      await ndef.scan();

      ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
        console.log(`> Serial Number: ${serialNumber}`);
        // Extrair texto do primeiro record
        const decoder = new TextDecoder();
        for (const record of message.records) {
          if (record.recordType === 'text') {
            setScannedData(decoder.decode(record.data));
          }
        }
        setIsReading(false);
      });
    } catch (err) {
      console.error('NFC scan failed:', err);
      setIsReading(false);
    }
  };

  return { isSupported, isReading, scannedData, startScan, feature: 'NFC Tap-to-Set' };
}
