import type { ManholeProfile } from '../../types/manhole';
import type { DimensionSet, DimensionEntry, DimensionAnnotation } from '../../types/dimension';

export function generateCompactDimensions(
  profile: ManholeProfile,
  center: { x: number; y: number },
  outerRadius: number
): DimensionSet {
  const dimensions: DimensionEntry[] = [];
  const annotations: DimensionAnnotation[] = [];

  // Manhole diameter
  dimensions.push({
    category: 'Manhole',
    item: 'Diameter',
    value: profile.diameter,
    unit: 'in',
    standardRef: 'ASTM C478',
  });

  annotations.push({
    id: 'dim-diameter',
    type: 'linear',
    startPoint: { x: center.x - outerRadius, y: center.y },
    endPoint: { x: center.x + outerRadius, y: center.y },
    offsetDistance: outerRadius * 0.4,
    value: `${profile.diameter}"`,
    fontSize: 0,
    rotation: 0,
  });

  // Depth
  if (profile.depth > 0) {
    dimensions.push({
      category: 'Manhole',
      item: 'Depth',
      value: profile.depth,
      unit: 'ft',
      standardRef: '',
    });

    annotations.push({
      id: 'dim-depth',
      type: 'label',
      startPoint: { x: center.x, y: center.y - outerRadius * 1.5 },
      endPoint: { x: center.x, y: center.y - outerRadius * 1.5 },
      offsetDistance: 0,
      value: `Depth: ${profile.depth}'`,
      fontSize: 0,
      rotation: 0,
    });
  }

  // Pipe sizes and inverts
  for (const pipe of profile.pipes) {
    dimensions.push({
      category: `Pipe ${pipe.id.replace('pipe-', '')}`,
      item: 'Size',
      value: `${pipe.nominalDiameter}" ${pipe.material}`,
      unit: '',
      standardRef: '',
    });

    if (pipe.invert > 0) {
      dimensions.push({
        category: `Pipe ${pipe.id.replace('pipe-', '')}`,
        item: 'Invert',
        value: pipe.invert,
        unit: 'ft',
        standardRef: '',
      });
    }

    dimensions.push({
      category: `Pipe ${pipe.id.replace('pipe-', '')}`,
      item: 'Direction',
      value: pipe.direction,
      unit: '',
      standardRef: '',
    });

    // Pipe label annotation
    const pipeAngleRad = (pipe.angleDeg * Math.PI) / 180;
    const labelDist = outerRadius * 1.6;
    annotations.push({
      id: `dim-pipe-${pipe.id}`,
      type: 'label',
      startPoint: {
        x: center.x + labelDist * Math.sin(pipeAngleRad),
        y: center.y + labelDist * Math.cos(pipeAngleRad),
      },
      endPoint: {
        x: center.x + labelDist * Math.sin(pipeAngleRad),
        y: center.y + labelDist * Math.cos(pipeAngleRad),
      },
      offsetDistance: 0,
      value: `${pipe.nominalDiameter}" ${pipe.material} ${pipe.direction.toUpperCase()}${pipe.invert > 0 ? `\nIE: ${pipe.invert}'` : ''}`,
      fontSize: 0,
      rotation: 0,
    });
  }

  return {
    level: 'compact',
    label: 'Compact / Minimal',
    description: 'Critical dimensions only: diameter, depth, pipe sizes, and inverts',
    dimensions,
    annotations,
  };
}
