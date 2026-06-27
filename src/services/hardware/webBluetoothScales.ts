/**
 * Item 69: Balanças via Web Bluetooth
 * Capability guard; no fake connections.
 */
import { useState, useEffect } from 'react';

export function useBluetoothCapability() {
  const [isSupported, setIsSupported] = useState<boolean>(false);

  const [device, setDevice] = useState<any>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Detect Web Bluetooth API
    const nav = navigator as any;
    if (nav.bluetooth && typeof nav.bluetooth.requestDevice === 'function') {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  const connect = async () => {
    if (!isSupported) return;
    setLoading(true);
    try {
      const nav = navigator as any;
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: ['weight_scale'] }],
        optionalServices: ['body_composition'],
      });
      setDevice(device);

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('weight_scale');
      const characteristic = await service.getCharacteristic('weight_measurement');

      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        // Parsing simplificado para exemplo (formato padrão BLE Weight Measurement)
        const weightValue = value.getUint16(1, true) * 0.005; // Depende da escala
        setWeight(weightValue);
      });

      await characteristic.startNotifications();
    } catch (err) {
      console.error('Bluetooth connection failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return { isSupported, connect, device, weight, loading, feature: 'Balança via Web Bluetooth' };
}
