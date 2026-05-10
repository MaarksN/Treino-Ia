export type PlatformBlockId =
  | 'bloco-11'
  | 'bloco-12'
  | 'bloco-13'
  | 'bloco-14'
  | 'bloco-15'
  | 'bloco-16'
  | 'bloco-17'
  | 'bloco-18'
  | 'bloco-19'
  | 'bloco-20';

export type BlockPriority = 'MVP / Base' | 'Premium / V2' | 'Roadmap / Futuro';

export type BlockCoverage = 'ui' | 'service' | 'type' | 'docs';

export type BlockStatus = 'active' | 'fallback' | 'mock' | 'roadmap';

export interface PlatformFeature {
  id: number;
  title: string;
  priority: BlockPriority;
  coverage: BlockCoverage;
  status: BlockStatus;
}

export interface PlatformBlockDefinition {
  id: PlatformBlockId;
  number: number;
  title: string;
  shortTitle: string;
  objective: string;
  layers: string[];
  featureFlag: string;
  features: PlatformFeature[];
}
