// Standard pipe outside diameters by nominal size and material (inches)

export interface PipeSpec {
  nominalSize: number; // inches
  material: string;
  outerDiameter: number; // inches
  innerDiameter: number; // inches
}

export const PIPE_OD_TABLE: Record<number, Record<string, number>> = {
  4: { VCP: 5.9, RCP: 6.0, PVC: 4.5, HDPE: 4.5, DIP: 4.8 },
  6: { VCP: 8.0, RCP: 8.0, PVC: 6.625, HDPE: 6.625, DIP: 6.9 },
  8: { VCP: 10.3, RCP: 10.25, PVC: 8.625, HDPE: 8.625, DIP: 9.05 },
  10: { VCP: 12.5, RCP: 12.5, PVC: 10.75, HDPE: 10.75, DIP: 11.1 },
  12: { VCP: 15.0, RCP: 15.25, PVC: 12.75, HDPE: 12.75, DIP: 13.2 },
  15: { VCP: 18.7, RCP: 18.75, PVC: 15.3, DIP: 15.3 },
  18: { RCP: 22.0, PVC: 18.0, DIP: 19.5 },
  21: { RCP: 25.0, DIP: 22.95 },
  24: { RCP: 28.0, PVC: 24.0, DIP: 25.8 },
  27: { RCP: 32.0 },
  30: { RCP: 36.0, DIP: 32.0 },
  36: { RCP: 42.0, DIP: 38.3 },
  42: { RCP: 49.0 },
  48: { RCP: 55.0 },
};

// Standard nominal pipe sizes (inches)
export const STANDARD_PIPE_SIZES = [4, 6, 8, 10, 12, 15, 18, 21, 24, 27, 30, 36, 42, 48];

// Material abbreviations
export const PIPE_MATERIALS: Record<string, string> = {
  VCP: 'Vitrified Clay Pipe',
  RCP: 'Reinforced Concrete Pipe',
  PVC: 'Polyvinyl Chloride',
  HDPE: 'High Density Polyethylene',
  DIP: 'Ductile Iron Pipe',
  CMP: 'Corrugated Metal Pipe',
  ABS: 'Acrylonitrile Butadiene Styrene',
};

// Find nearest standard pipe size from a measured diameter
export function findNearestPipeSize(measuredDiameter: number): {
  nominalSize: number;
  material: string;
  od: number;
} {
  let bestMatch = { nominalSize: 8, material: 'RCP', od: 10.25 };
  let bestDiff = Infinity;

  for (const [sizeStr, materials] of Object.entries(PIPE_OD_TABLE)) {
    const size = parseInt(sizeStr);
    for (const [material, od] of Object.entries(materials)) {
      const diff = Math.abs(od - measuredDiameter);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestMatch = { nominalSize: size, material, od };
      }
    }
  }

  return bestMatch;
}

// Get OD for a specific pipe size and material
export function getPipeOD(nominalSize: number, material: string): number | undefined {
  return PIPE_OD_TABLE[nominalSize]?.[material];
}
