export type DimensionLevel = 'compact' | 'standard' | 'detailed';

export interface DimensionEntry {
  category: string;
  item: string;
  value: string | number;
  unit: string;
  standardRef: string;
}

export interface DimensionAnnotation {
  id: string;
  type: 'linear' | 'radial' | 'angular' | 'label' | 'note';
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  offsetDistance: number;
  value: string;
  fontSize: number;
  rotation: number;
}

export interface DimensionSet {
  level: DimensionLevel;
  label: string;
  description: string;
  dimensions: DimensionEntry[];
  annotations: DimensionAnnotation[];
}

export interface DimensionResult {
  compact: DimensionSet;
  standard: DimensionSet;
  detailed: DimensionSet;
}
