import { create } from 'zustand';
import type { ParsedDxf, DenormalizedEntity, BoundingBox } from '../types/dxf';
import type { ManholeProfile } from '../types/manhole';
import type { DimensionResult, DimensionLevel } from '../types/dimension';

type AppStep = 'upload' | 'viewer' | 'dimensions' | 'export';

interface AppState {
  // Navigation
  step: AppStep;
  setStep: (step: AppStep) => void;

  // DXF data
  filename: string | null;
  rawText: string | null;
  parsedDxf: ParsedDxf | null;
  entities: DenormalizedEntity[];
  boundingBox: BoundingBox | null;
  visibleLayers: string[];

  setDxfData: (
    filename: string,
    rawText: string,
    parsed: ParsedDxf,
    entities: DenormalizedEntity[],
    boundingBox: BoundingBox,
    layers: string[]
  ) => void;
  toggleLayer: (layer: string) => void;
  resetDxf: () => void;

  // Manhole profile
  manholeProfile: ManholeProfile | null;
  setManholeProfile: (profile: ManholeProfile) => void;

  // Dimensions
  dimensionResult: DimensionResult | null;
  selectedLevel: DimensionLevel | null;
  setDimensionResult: (result: DimensionResult) => void;
  setSelectedLevel: (level: DimensionLevel) => void;

  // Loading
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  step: 'upload',
  setStep: (step) => set({ step }),

  filename: null,
  rawText: null,
  parsedDxf: null,
  entities: [],
  boundingBox: null,
  visibleLayers: [],

  setDxfData: (filename, rawText, parsed, entities, boundingBox, layers) =>
    set({
      filename,
      rawText,
      parsedDxf: parsed,
      entities,
      boundingBox,
      visibleLayers: layers,
      step: 'viewer',
      error: null,
    }),
  toggleLayer: (layer) =>
    set((state) => ({
      visibleLayers: state.visibleLayers.includes(layer)
        ? state.visibleLayers.filter((l) => l !== layer)
        : [...state.visibleLayers, layer],
    })),
  resetDxf: () =>
    set({
      filename: null,
      rawText: null,
      parsedDxf: null,
      entities: [],
      boundingBox: null,
      visibleLayers: [],
      manholeProfile: null,
      dimensionResult: null,
      selectedLevel: null,
      step: 'upload',
      error: null,
    }),

  manholeProfile: null,
  setManholeProfile: (profile) => set({ manholeProfile: profile }),

  dimensionResult: null,
  selectedLevel: null,
  setDimensionResult: (result) => set({ dimensionResult: result, step: 'dimensions' }),
  setSelectedLevel: (level) => set({ selectedLevel: level }),

  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),
}));
