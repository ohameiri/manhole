import type { PipeEntry, PipeDirection } from '../../types/manhole';
import { findNearestPipeSize, PIPE_OD_TABLE } from '../standards/pipeStandards';
import { calculateOpeningSize } from '../standards/astmC478';
import type { DetectedPipe } from './manholeDetector';

interface TextLabel {
  text: string;
  x: number;
  y: number;
}

// Parse invert elevation from text like "INV 93.25", "IE=93.25", "INV. EL. 93.25"
function parseInvertFromText(text: string): number | null {
  const patterns = [
    /INV\.?\s*(?:EL\.?\s*)?=?\s*([\d.]+)/i,
    /IE\s*=?\s*([\d.]+)/i,
    /EL\.?\s*=?\s*([\d.]+)/i,
    /INVERT\s*=?\s*([\d.]+)/i,
  ];

  for (const p of patterns) {
    const match = text.match(p);
    if (match) return parseFloat(match[1]);
  }

  return null;
}

// Parse pipe size and material from text like '8" VCP', '12" RCP', '8-INCH PVC'
function parsePipeSizeFromText(text: string): { size: number; material: string } | null {
  const patterns = [
    /(\d+)["'']\s*([A-Z]{2,5})/i,
    /(\d+)\s*[-]?\s*(?:INCH|IN)\s*([A-Z]{2,5})/i,
    /(\d+)\s*([A-Z]{2,5})\s*(?:PIPE)?/i,
  ];

  for (const p of patterns) {
    const match = text.match(p);
    if (match) {
      const size = parseInt(match[1]);
      const material = match[2].toUpperCase();
      if (PIPE_OD_TABLE[size]) {
        return { size, material };
      }
    }
  }

  return null;
}

// Determine pipe direction from text and angle
function determinePipeDirection(
  labels: TextLabel[],
  pipe: DetectedPipe,
  allPipes: DetectedPipe[]
): PipeDirection {
  // Check nearby text labels for direction keywords
  for (const label of labels) {
    const dx = label.x - pipe.center.x;
    const dy = label.y - pipe.center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < pipe.radius * 5) {
      const upper = label.text.toUpperCase();
      if (/OUTLET|OUT|OUTFALL|EFF/.test(upper)) return 'outlet';
      if (/INLET|IN|INFL/.test(upper)) return 'inlet';
    }
  }

  // Heuristic: if there's only one pipe at a particular side, it's likely the outlet
  // The lowest invert is typically the outlet
  if (allPipes.length > 1) {
    return 'inlet'; // default to inlet; we'll pick outlet later
  }

  return 'unknown';
}

export function analyzePipes(
  detectedPipes: DetectedPipe[],
  labels: TextLabel[],
  _manholeCenter: { x: number; y: number }
): PipeEntry[] {
  const entries: PipeEntry[] = [];

  for (let i = 0; i < detectedPipes.length; i++) {
    const dp = detectedPipes[i];
    const measuredDiameter = dp.radius * 2;

    // Find nearest standard pipe size
    const match = findNearestPipeSize(measuredDiameter);

    // Look for text labels near this pipe
    let sizeOverride: { size: number; material: string } | null = null;
    let invertValue: number | null = null;

    for (const label of labels) {
      const dx = label.x - dp.center.x;
      const dy = label.y - dp.center.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < dp.radius * 8) {
        if (!sizeOverride) {
          sizeOverride = parsePipeSizeFromText(label.text);
        }
        if (invertValue === null) {
          invertValue = parseInvertFromText(label.text);
        }
      }
    }

    const nominalSize = sizeOverride?.size || match.nominalSize;
    const material = sizeOverride?.material || match.material;
    const od = match.od;

    const direction = determinePipeDirection(labels, dp, detectedPipes);

    entries.push({
      id: `pipe-${i + 1}`,
      nominalDiameter: nominalSize,
      material,
      invert: invertValue || 0,
      angleDeg: dp.angleDeg,
      direction,
      outerDiameter: od,
      openingSize: calculateOpeningSize(od),
      position: dp.center,
    });
  }

  // If no outlet was found, pick the pipe with the lowest invert
  const hasOutlet = entries.some((e) => e.direction === 'outlet');
  if (!hasOutlet && entries.length > 0) {
    const pipesWithInvert = entries.filter((e) => e.invert > 0);
    if (pipesWithInvert.length > 0) {
      const lowestInvert = pipesWithInvert.reduce((a, b) =>
        a.invert < b.invert ? a : b
      );
      lowestInvert.direction = 'outlet';
    } else {
      entries[0].direction = 'outlet';
    }
    // Mark the rest as inlets
    for (const e of entries) {
      if (e.direction === 'unknown') e.direction = 'inlet';
    }
  }

  return entries;
}
