import type { DenormalizedEntity } from '../../types/dxf';
import type { ManholeType } from '../../types/manhole';

export interface DetectedManhole {
  center: { x: number; y: number };
  outerRadius: number;
  innerRadius: number | null;
  wallThickness: number;
  diameter: number; // inner diameter in drawing units
}

export interface DetectedPipe {
  center: { x: number; y: number };
  radius: number;
  angleDeg: number; // from manhole center, clockwise from north
  distanceFromCenter: number;
}

// Find the manhole wall: the largest circle(s) in the drawing
export function detectManhole(entities: DenormalizedEntity[]): DetectedManhole | null {
  const circles = entities.filter(
    (e) => e.type === 'CIRCLE' && e.center && e.radius != null
  );

  if (circles.length === 0) return null;

  // Sort by radius descending
  circles.sort((a, b) => (b.radius || 0) - (a.radius || 0));

  const largest = circles[0];
  const outerRadius = largest.radius!;
  const center = { x: largest.center.x, y: largest.center.y };

  // Look for a concentric inner circle (wall thickness)
  let innerRadius: number | null = null;
  for (let i = 1; i < circles.length; i++) {
    const c = circles[i];
    const dx = c.center.x - center.x;
    const dy = c.center.y - center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // If concentric (within 5% of outer radius tolerance)
    if (dist < outerRadius * 0.05 && c.radius! < outerRadius && c.radius! > outerRadius * 0.5) {
      innerRadius = c.radius!;
      break;
    }
  }

  const wallThickness = innerRadius ? outerRadius - innerRadius : outerRadius / 12;
  const diameter = innerRadius ? innerRadius * 2 : (outerRadius - wallThickness) * 2;

  return {
    center,
    outerRadius,
    innerRadius,
    wallThickness,
    diameter,
  };
}

// Detect pipes as smaller circles near/intersecting the manhole wall
export function detectPipes(
  entities: DenormalizedEntity[],
  manhole: DetectedManhole
): DetectedPipe[] {
  const circles = entities.filter(
    (e) => e.type === 'CIRCLE' && e.center && e.radius != null
  );

  const pipes: DetectedPipe[] = [];

  for (const c of circles) {
    const dx = c.center.x - manhole.center.x;
    const dy = c.center.y - manhole.center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const r = c.radius!;

    // Pipe: smaller than manhole, and its center is near or beyond the wall
    if (
      r < manhole.outerRadius * 0.4 &&
      r > 0.5 && // minimum size
      dist > manhole.outerRadius * 0.3
    ) {
      // Angle from center, clockwise from north (12 o'clock = 0)
      let angleDeg = (Math.atan2(dx, dy) * 180) / Math.PI;
      if (angleDeg < 0) angleDeg += 360;

      pipes.push({
        center: { x: c.center.x, y: c.center.y },
        radius: r,
        angleDeg,
        distanceFromCenter: dist,
      });
    }
  }

  return pipes;
}

// Extract text entities near the manhole that might contain dimension info
export function extractTextLabels(
  entities: DenormalizedEntity[],
  manhole: DetectedManhole
): Array<{ text: string; x: number; y: number }> {
  const labels: Array<{ text: string; x: number; y: number }> = [];
  const searchRadius = manhole.outerRadius * 3;

  for (const e of entities) {
    if ((e.type === 'TEXT' || e.type === 'MTEXT') && e.position && e.text) {
      const dx = e.position.x - manhole.center.x;
      const dy = e.position.y - manhole.center.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < searchRadius) {
        labels.push({
          text: String(e.text).trim(),
          x: e.position.x,
          y: e.position.y,
        });
      }
    }
  }

  return labels;
}

// Try to determine the manhole type from text labels
export function detectManholeType(
  labels: Array<{ text: string }>
): ManholeType {
  const allText = labels.map((l) => l.text.toUpperCase()).join(' ');

  if (/SANITARY|SEWER|SS|SAN/.test(allText)) return 'sanitary';
  if (/TELECOM|DUCT|CABLE|COMM/.test(allText)) return 'telecom';
  if (/ELECTRICAL|ELEC|POWER|CONDUIT/.test(allText)) return 'electrical';

  return 'sanitary'; // default to sanitary sewer
}
