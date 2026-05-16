export interface BodyMetric {
  id: string;
  date: string;
  weight?: number;
  bodyFatPercent?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  arm?: number;
  thigh?: number;
  photoBase64?: string;
  aiAnalysis?: string;
}

export type BodyPhotoAngle = 'front' | 'side' | 'back' | 'other';

export interface BodyProgressPhoto {
  id: string;
  date: string;
  monthKey: string;
  angle: BodyPhotoAngle;
  mimeType: string;
  storagePath?: string;
  photoBase64?: string;
  photoUrl?: string;
  aiAnalysis?: string;
}

export interface RecompositionGoal {
  id: string;
  title: string;
  createdAt: string;
  targetDate: string;
  status: 'active' | 'completed' | 'paused';
  startWeight?: number;
  targetWeight?: number;
  startBodyFatPercent?: number;
  targetBodyFatPercent?: number;
  startWaist?: number;
  targetWaist?: number;
  notes?: string;
}
