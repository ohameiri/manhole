import type { DenormalizedEntity } from '../../types/dxf';
import type { ManholeProfile } from '../../types/manhole';
import type { DimensionResult } from '../../types/dimension';
import { detectManhole, detectPipes, extractTextLabels, detectManholeType } from './manholeDetector';
import { analyzePipes } from './pipeAnalyzer';
import { calculateWallThickness, nearestStandardDiameter, requiresExternalDrop } from '../standards/astmC478';
import { generateCompactDimensions } from './compactDimensions';
import { generateStandardDimensions } from './standardDimensions';
import { generateDetailedDimensions } from './detailedDimensions';

// Parse rim elevation from text labels
function parseRimElevation(labels: Array<{ text: string }>): number {
  for (const l of labels) {
    const match = l.text.match(/RIM\s*(?:EL\.?\s*)?=?\s*([\d.]+)/i);
    if (match) return parseFloat(match[1]);
    const topMatch = l.text.match(/TOP\s*(?:EL\.?\s*)?=?\s*([\d.]+)/i);
    if (topMatch) return parseFloat(topMatch[1]);
  }
  return 0;
}

// Parse depth from text labels
function parseDepth(labels: Array<{ text: string }>): number {
  for (const l of labels) {
    const match = l.text.match(/DEPTH\s*=?\s*([\d.]+)/i);
    if (match) return parseFloat(match[1]);
    const ftMatch = l.text.match(/([\d.]+)\s*(?:FT|FEET|')\s*(?:DEEP|DEPTH)/i);
    if (ftMatch) return parseFloat(ftMatch[1]);
  }
  return 0;
}

export function analyzeManhole(entities: DenormalizedEntity[]): ManholeProfile | null {
  const manhole = detectManhole(entities);
  if (!manhole) return null;

  const labels = extractTextLabels(entities, manhole);
  const manholeType = detectManholeType(labels);
  const detectedPipes = detectPipes(entities, manhole);
  const pipes = analyzePipes(detectedPipes, labels, manhole.center);

  // Get standard diameter
  const standardDiameter = nearestStandardDiameter(manhole.diameter);
  const wallThickness = calculateWallThickness(standardDiameter);

  // Parse elevations
  const rimElevation = parseRimElevation(labels);
  const lowestInvert = pipes.length > 0
    ? Math.min(...pipes.filter(p => p.invert > 0).map(p => p.invert))
    : 0;
  const depth = parseDepth(labels) || (rimElevation && lowestInvert ? rimElevation - lowestInvert : 0);

  // Check for drop connections
  const hasDropConnection = pipes.some(
    (p) => p.invert > 0 && lowestInvert > 0 && requiresExternalDrop(p.invert, lowestInvert)
  );

  // Structural leg violations
  const structuralLegViolations: string[] = [];
  for (let i = 0; i < pipes.length; i++) {
    for (let j = i + 1; j < pipes.length; j++) {
      const angleDiff = Math.abs(pipes[i].angleDeg - pipes[j].angleDeg);
      const arcAngle = Math.min(angleDiff, 360 - angleDiff);
      const circumference = Math.PI * standardDiameter;
      const arcLength = (arcAngle / 360) * circumference;
      const gapLength = arcLength - pipes[i].openingSize / 2 - pipes[j].openingSize / 2;
      if (gapLength < 6) {
        structuralLegViolations.push(
          `${pipes[i].id} / ${pipes[j].id}: ${gapLength.toFixed(1)}" (min 6" required)`
        );
      }
    }
  }

  return {
    type: manholeType,
    diameter: standardDiameter,
    depth,
    wallThickness,
    rimElevation,
    invertElevation: lowestInvert,
    accessOpeningDiameter: 24,
    pipes,
    center: manhole.center,
    gradeRingHeight: 4,
    coneType: standardDiameter >= 60 ? 'eccentric' : 'flat',
    hasDropConnection,
    structuralLegViolations,
  };
}

export function generateDimensions(
  profile: ManholeProfile,
  center: { x: number; y: number },
  outerRadius: number
): DimensionResult {
  return {
    compact: generateCompactDimensions(profile, center, outerRadius),
    standard: generateStandardDimensions(profile, center, outerRadius),
    detailed: generateDetailedDimensions(profile, center, outerRadius),
  };
}
