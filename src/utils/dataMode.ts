import { env } from '../config/env';
import { DataMode } from '../types/trainingExecution';

export function ensureSafeDataMode(dataMode: DataMode): DataMode {
  if (env.isProduction && dataMode === 'mock_dev_only') {
    throw new Error('Mock data mode is not allowed in production.');
  }
  return dataMode;
}
