import type { BoundingBox } from '../../types/dxf';
import type { DimensionLevel } from '../../types/dimension';

export interface FontSizeConfig {
  dimensionText: number;
  annotationText: number;
  titleText: number;
  noteText: number;
  arrowSize: number;
  extensionLineGap: number;
  lineWidth: number;
}

export function calculateFontSizes(
  bbox: BoundingBox,
  level: DimensionLevel
): FontSizeConfig {
  const diagonal = Math.sqrt(bbox.width ** 2 + bbox.height ** 2);

  // Base font size: 1.5% of diagonal
  const baseFontSize = diagonal * 0.015;

  // Scale factor per level
  const scaleFactor: Record<DimensionLevel, number> = {
    compact: 1.2,
    standard: 1.0,
    detailed: 0.85,
  };

  const scale = scaleFactor[level];
  const fontSize = baseFontSize * scale;

  return {
    dimensionText: fontSize,
    annotationText: fontSize * 0.8,
    titleText: fontSize * 1.5,
    noteText: fontSize * 0.7,
    arrowSize: fontSize * 0.5,
    extensionLineGap: fontSize * 0.3,
    lineWidth: Math.max(fontSize * 0.05, 0.2),
  };
}
