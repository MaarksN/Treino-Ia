import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.treinoia.app',
  appName: 'Treino IA',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
