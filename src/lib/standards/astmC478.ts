// ASTM C478 Standard Specification for Circular Precast Reinforced Concrete Manhole Sections

export const ASTM_C478 = {
  // Standard manhole diameters (inches)
  standardDiameters: [48, 60, 72, 84, 96, 108, 120, 144],

  // Wall thickness = 1/12 of diameter, minimum 4"
  wallThicknessRatio: 1 / 12,
  minWallThickness: 4, // inches

  // Standard riser heights (inches)
  riserHeights: [12, 24, 36, 48],

  // Cone dimensions
  cone: {
    eccentricHeight: 24, // inches
    concentricHeight: 24, // inches
  },

  // Access opening
  accessOpeningDiameter: 24, // inches

  // Grade ring
  maxGradeRingHeight: 8, // inches

  // Minimum cover over reinforcement
  minCover: 0.75, // inches
};

export const PIPE_RULES = {
  // Opening size = pipe OD + 6 inches
  openingClearance: 6, // inches

  // Minimum structural leg between openings
  minStructuralLeg: 6, // inches (150mm)

  // Minimum drop between inlet and outlet inverts
  minInvertDrop: 1, // inch
  maxInvertDrop: 2, // inches (before requiring design justification)

  // External drop required threshold
  externalDropThreshold: 24, // inches (2 feet)

  // Crown matching rule: match crowns, not inverts, for different pipe sizes
  crownMatchingRequired: true,
};

// Calculate wall thickness per ASTM C478
export function calculateWallThickness(diameterInches: number): number {
  return Math.max(
    Math.round(diameterInches * ASTM_C478.wallThicknessRatio),
    ASTM_C478.minWallThickness
  );
}

// Find nearest standard manhole diameter
export function nearestStandardDiameter(measuredDiameter: number): number {
  return ASTM_C478.standardDiameters.reduce((prev, curr) =>
    Math.abs(curr - measuredDiameter) < Math.abs(prev - measuredDiameter)
      ? curr
      : prev
  );
}

// Calculate opening size for a pipe
export function calculateOpeningSize(pipeOD: number): number {
  return pipeOD + PIPE_RULES.openingClearance;
}

// Check if external drop is required
export function requiresExternalDrop(
  pipeInvert: number,
  manholeInvert: number
): boolean {
  const dropInches = (pipeInvert - manholeInvert) * 12;
  return dropInches > PIPE_RULES.externalDropThreshold;
}

// Validate structural leg between two openings
export function validateStructuralLeg(
  opening1Center: number,
  opening1Size: number,
  opening2Center: number,
  opening2Size: number,
  manholeCircumference: number
): { valid: boolean; legSize: number } {
  const arcDistance = Math.abs(opening1Center - opening2Center);
  const minDistance = Math.min(arcDistance, manholeCircumference - arcDistance);
  const legSize = minDistance - opening1Size / 2 - opening2Size / 2;
  return {
    valid: legSize >= PIPE_RULES.minStructuralLeg,
    legSize,
  };
}
