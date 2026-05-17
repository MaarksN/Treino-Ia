import React, { useMemo } from 'react';
import { useNfcCapability } from '../../../services/hardware/nfcAdapter';
import { useWebXrCapability } from '../../../services/hardware/webXrAdapter';
import { useBluetoothCapability } from '../../../services/hardware/webBluetoothScales';
import { OuraUltrahumanProvider } from '../../../services/hardware/ouraUltrahumanProvider';
import { IoTMatAdapter } from '../../../services/hardware/iotMatProvider';
import { Settings, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export function HardwareCapabilitiesPanel() {
  const nfc = useNfcCapability();
  const xr = useWebXrCapability();
  const bluetooth = useBluetoothCapability();

  const wearProvider = useMemo(() => new OuraUltrahumanProvider(), []);
  const matProvider = useMemo(() => new IoTMatAdapter(), []);

  const features = [
    {
      id: 66,
      name: nfc.feature,
      status: nfc.isSupported ? 'Disponível' : 'Não Suportado no Browser',
      isReady: nfc.isSupported
    },
    {
      id: 67,
      name: xr.feature,
      status: xr.isSupported ? 'Disponível' : 'Não Suportado no Browser',
      isReady: xr.isSupported
    },
    {
      id: 68,
      name: 'Oura/Ultrahuman',
      status: wearProvider.isConfigured() ? 'Conectado' : 'Aguardando Configuração',
      isReady: wearProvider.isConfigured()
    },
    {
      id: 69,
      name: bluetooth.feature,
      status: bluetooth.isSupported ? 'Disponível' : 'Não Suportado no Browser',
      isReady: bluetooth.isSupported
    },
    {
      id: 70,
      name: 'Tapete IoT',
      status: matProvider.isSupported() ? 'Conectado' : 'Bloqueado (Alto Risco)',
      isReady: matProvider.isSupported()
    }
  ];

  return (
    <section className="mb-8 rounded-[28px] border-4 border-brand-light/20 bg-brand-dark p-6 shadow-brutal-dark md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6 text-brand-neon" />
        <h2 className="font-display text-2xl uppercase tracking-widest text-brand-light">Hardware & IoT (Lote 14)</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.id} className="flex items-center gap-3 rounded-[16px] border-2 border-brand-light/10 bg-brand-gray/50 p-4">
            {f.isReady ? (
              <CheckCircle className="h-5 w-5 text-brand-neon" />
            ) : f.status.includes('Bloqueado') || f.status.includes('Aguardando') ? (
              <AlertTriangle className="h-5 w-5 text-brand-magenta" />
            ) : (
              <XCircle className="h-5 w-5 text-brand-muted" />
            )}
            <div>
              <p className="font-mono text-xs text-brand-light font-bold uppercase">{f.name}</p>
              <p className="font-mono text-[10px] text-brand-light/60">{f.status}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
