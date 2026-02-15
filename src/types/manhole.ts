export type ManholeType = 'sanitary' | 'telecom' | 'electrical' | 'unknown';

export type PipeDirection = 'inlet' | 'outlet' | 'unknown';

export interface PipeEntry {
  id: string;
  nominalDiameter: number; // inches
  material: string;
  invert: number; // elevation in feet
  angleDeg: number; // clockwise from north (or outlet at 0)
  direction: PipeDirection;
  outerDiameter: number; // inches
  openingSize: number; // OD + 6"
  position: { x: number; y: number };
}

export interface ManholeProfile {
  type: ManholeType;
  diameter: number; // inches
  depth: number; // feet
  wallThickness: number; // inches
  rimElevation: number; // feet
  invertElevation: number; // feet (lowest invert)
  accessOpeningDiameter: number; // inches
  pipes: PipeEntry[];
  center: { x: number; y: number };
  // Calculated values
  gradeRingHeight: number;
  coneType: 'eccentric' | 'concentric' | 'flat' | 'unknown';
  hasDropConnection: boolean;
  structuralLegViolations: string[];
}
