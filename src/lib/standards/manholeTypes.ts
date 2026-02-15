import type { ManholeType } from '../../types/manhole';

export interface ManholeTypeInfo {
  type: ManholeType;
  label: string;
  description: string;
  typicalFeatures: string[];
}

export const MANHOLE_TYPES: Record<ManholeType, ManholeTypeInfo> = {
  sanitary: {
    type: 'sanitary',
    label: 'Sanitary Sewer',
    description: 'Sanitary sewer manhole with pipe inverts and channels',
    typicalFeatures: [
      'Invert channels',
      'Bench/shelf',
      'Pipe connections (inlet/outlet)',
      'Steps or ladder',
      'Grade rings',
      'Cone or flat top',
    ],
  },
  telecom: {
    type: 'telecom',
    label: 'Telecommunications',
    description: 'Telecom/electrical manhole with duct banks and cable entries',
    typicalFeatures: [
      'Duct banks',
      'Cable racks',
      'Pulling irons',
      'Grounding system',
      'Sump/drain',
    ],
  },
  electrical: {
    type: 'electrical',
    label: 'Electrical',
    description: 'Electrical utility manhole for power distribution',
    typicalFeatures: [
      'Conduit entries',
      'Cable racks',
      'Transformer vault',
      'Grounding system',
      'Ventilation',
    ],
  },
  unknown: {
    type: 'unknown',
    label: 'Unknown',
    description: 'Manhole type not determined',
    typicalFeatures: [],
  },
};
