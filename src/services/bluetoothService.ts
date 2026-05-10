import { HeartRateReading, HRZones, WearableSession } from '../types';

const SESSION_KEY = '@TreinoApp:wearableSessions';

type BluetoothCharacteristicValueEvent = Event & {
  target: BluetoothRemoteGATTCharacteristicLike;
};

type BluetoothRemoteGATTCharacteristicLike = EventTarget & {
  value?: DataView;
  startNotifications: () => Promise<void>;
  stopNotifications: () => Promise<void>;
};

type BluetoothRemoteGATTServiceLike = {
  getCharacteristic: (name: string) => Promise<BluetoothRemoteGATTCharacteristicLike>;
};

type BluetoothRemoteGATTServerLike = {
  connected?: boolean;
  connect: () => Promise<BluetoothRemoteGATTServerLike>;
  disconnect: () => void;
  getPrimaryService: (name: string) => Promise<BluetoothRemoteGATTServiceLike>;
};

type BluetoothDeviceLike = {
  name?: string;
  gatt?: BluetoothRemoteGATTServerLike;
};

type BluetoothNavigator = Navigator & {
  bluetooth?: {
    requestDevice: (options: {
      filters: Array<{ services: string[] }>;
      optionalServices?: string[];
    }) => Promise<BluetoothDeviceLike>;
  };
};

export function loadWearableSessions(): WearableSession[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWearableSession(session: WearableSession) {
  const sessions = loadWearableSessions();
  sessions.push(session);
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessions.slice(-50)));
}

export function calcHRZones(readings: HeartRateReading[], maxHRAge: number): HRZones {
  const zones: HRZones = { zone1: 0, zone2: 0, zone3: 0, zone4: 0, zone5: 0 };

  readings.forEach(reading => {
    const pct = (reading.bpm / maxHRAge) * 100;
    if (pct < 60) zones.zone1 += 1;
    else if (pct < 70) zones.zone2 += 1;
    else if (pct < 80) zones.zone3 += 1;
    else if (pct < 90) zones.zone4 += 1;
    else zones.zone5 += 1;
  });

  return zones;
}

export function estimateCalories(
  readings: HeartRateReading[],
  weightKg: number,
  ageYears: number,
  isMale: boolean,
  durationMin: number
): number {
  const avgHR = readings.length
    ? readings.reduce((sum, reading) => sum + reading.bpm, 0) / readings.length
    : 120;

  if (durationMin <= 0) return 0;

  const calories = isMale
    ? ((-55.0969 + (0.6309 * avgHR) + (0.1988 * weightKg) + (0.2017 * ageYears)) / 4.184) * durationMin
    : ((-20.4022 + (0.4472 * avgHR) - (0.1263 * weightKg) + (0.074 * ageYears)) / 4.184) * durationMin;

  return Math.max(0, Math.round(calories));
}

type HRCallback = (reading: HeartRateReading) => void;

let bluetoothDevice: BluetoothDeviceLike | null = null;
let hrCharacteristic: BluetoothRemoteGATTCharacteristicLike | null = null;
let currentListener: ((event: Event) => void) | null = null;

export async function connectHeartRateMonitor(onReading: HRCallback): Promise<string> {
  const bluetooth = (navigator as BluetoothNavigator).bluetooth;
  if (!bluetooth) throw new Error('Web Bluetooth não suportado neste browser.');

  const device = await bluetooth.requestDevice({
    filters: [{ services: ['heart_rate'] }],
    optionalServices: ['battery_service', 'device_information'],
  });

  if (!device.gatt) throw new Error('Dispositivo sem servidor GATT disponível.');

  bluetoothDevice = device;
  const server = await device.gatt.connect();
  const service = await server.getPrimaryService('heart_rate');
  const characteristic = await service.getCharacteristic('heart_rate_measurement');
  hrCharacteristic = characteristic;

  currentListener = (event: Event) => {
    const target = (event as BluetoothCharacteristicValueEvent).target;
    const value = target.value;
    if (!value || value.byteLength < 2) return;

    const flags = value.getUint8(0);
    const is16bit = Boolean(flags & 0x1);
    const bpm = is16bit ? value.getUint16(1, true) : value.getUint8(1);
    onReading({ bpm, timestamp: Date.now() });
  };

  characteristic.addEventListener('characteristicvaluechanged', currentListener);
  await characteristic.startNotifications();
  return device.name || 'Monitor de FC';
}

export async function disconnectHeartRateMonitor() {
  if (hrCharacteristic) {
    if (currentListener) {
      hrCharacteristic.removeEventListener('characteristicvaluechanged', currentListener);
      currentListener = null;
    }
    await hrCharacteristic.stopNotifications().catch(() => {});
    hrCharacteristic = null;
  }

  if (bluetoothDevice?.gatt?.connected) {
    bluetoothDevice.gatt.disconnect();
  }

  bluetoothDevice = null;
}

export function isBluetoothSupported(): boolean {
  return typeof navigator !== 'undefined' && Boolean((navigator as BluetoothNavigator).bluetooth);
}
