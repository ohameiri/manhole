import type { ManholeProfile } from '../../types/manhole';
import type { DimensionSet, DimensionEntry, DimensionAnnotation } from '../../types/dimension';
import { ASTM_C478, PIPE_RULES } from '../standards/astmC478';

export function generateStandardDimensions(
  profile: ManholeProfile,
  center: { x: number; y: number },
  outerRadius: number
): DimensionSet {
  const dimensions: DimensionEntry[] = [];
  const annotations: DimensionAnnotation[] = [];

  // === MANHOLE STRUCTURE ===
  dimensions.push({
    category: 'Manhole',
    item: 'Diameter',
    value: profile.diameter,
    unit: 'in',
    standardRef: 'ASTM C478',
  });

  dimensions.push({
    category: 'Manhole',
    item: 'Wall Thickness',
    value: profile.wallThickness,
    unit: 'in',
    standardRef: `ASTM C478 (1/12 rule, min ${ASTM_C478.minWallThickness}")`,
  });

  if (profile.depth > 0) {
    dimensions.push({
      category: 'Manhole',
      item: 'Depth',
      value: profile.depth,
      unit: 'ft',
      standardRef: '',
    });
  }

  if (profile.rimElevation > 0) {
    dimensions.push({
      category: 'Manhole',
      item: 'Rim Elevation',
      value: profile.rimElevation,
      unit: 'ft',
      standardRef: '',
    });
  }

  if (profile.invertElevation > 0) {
    dimensions.push({
      category: 'Manhole',
      item: 'Invert Elevation',
      value: profile.invertElevation,
      unit: 'ft',
      standardRef: '',
    });
  }

  dimensions.push({
    category: 'Manhole',
    item: 'Access Opening',
    value: profile.accessOpeningDiameter,
    unit: 'in',
    standardRef: `ASTM C478 (min ${ASTM_C478.accessOpeningDiameter}")`,
  });

  dimensions.push({
    category: 'Manhole',
    item: 'Cone Type',
    value: profile.coneType,
    unit: '',
    standardRef: 'ASTM C478',
  });

  dimensions.push({
    category: 'Manhole',
    item: 'Grade Ring Height',
    value: profile.gradeRingHeight,
    unit: 'in',
    standardRef: `Max ${ASTM_C478.maxGradeRingHeight}"`,
  });

  // === ANNOTATIONS ===

  // Diameter dimension line
  annotations.push({
    id: 'std-diameter',
    type: 'linear',
    startPoint: { x: center.x - outerRadius, y: center.y },
    endPoint: { x: center.x + outerRadius, y: center.y },
    offsetDistance: outerRadius * 0.5,
    value: `${profile.diameter}" DIA`,
    fontSize: 0,
    rotation: 0,
  });

  // Wall thickness
  if (profile.wallThickness > 0) {
    annotations.push({
      id: 'std-wall',
      type: 'label',
      startPoint: { x: center.x + outerRadius * 1.2, y: center.y + outerRadius * 0.3 },
      endPoint: { x: center.x + outerRadius * 1.2, y: center.y + outerRadius * 0.3 },
      offsetDistance: 0,
      value: `Wall: ${profile.wallThickness}"`,
      fontSize: 0,
      rotation: 0,
    });
  }

  // Depth / elevation info
  if (profile.depth > 0) {
    annotations.push({
      id: 'std-depth',
      type: 'label',
      startPoint: { x: center.x, y: center.y - outerRadius * 1.7 },
      endPoint: { x: center.x, y: center.y - outerRadius * 1.7 },
      offsetDistance: 0,
      value: `Depth: ${profile.depth}' ${profile.rimElevation > 0 ? `| Rim El: ${profile.rimElevation}'` : ''}`,
      fontSize: 0,
      rotation: 0,
    });
  }

  // Access opening
  annotations.push({
    id: 'std-access',
    type: 'label',
    startPoint: { x: center.x, y: center.y + outerRadius * 1.7 },
    endPoint: { x: center.x, y: center.y + outerRadius * 1.7 },
    offsetDistance: 0,
    value: `Access: ${profile.accessOpeningDiameter}" DIA`,
    fontSize: 0,
    rotation: 0,
  });

  // === PIPES ===
  for (const pipe of profile.pipes) {
    dimensions.push({
      category: `Pipe ${pipe.id.replace('pipe-', '')}`,
      item: 'Nominal Size',
      value: pipe.nominalDiameter,
      unit: 'in',
      standardRef: '',
    });

    dimensions.push({
      category: `Pipe ${pipe.id.replace('pipe-', '')}`,
      item: 'Material',
      value: pipe.material,
      unit: '',
      standardRef: '',
    });

    dimensions.push({
      category: `Pipe ${pipe.id.replace('pipe-', '')}`,
      item: 'Direction',
      value: pipe.direction,
      unit: '',
      standardRef: '',
    });

    if (pipe.invert > 0) {
      dimensions.push({
        category: `Pipe ${pipe.id.replace('pipe-', '')}`,
        item: 'Invert Elevation',
        value: pipe.invert,
        unit: 'ft',
        standardRef: '',
      });
    }

    dimensions.push({
      category: `Pipe ${pipe.id.replace('pipe-', '')}`,
      item: 'Outer Diameter',
      value: pipe.outerDiameter.toFixed(2),
      unit: 'in',
      standardRef: '',
    });

    dimensions.push({
      category: `Pipe ${pipe.id.replace('pipe-', '')}`,
      item: 'Opening Size',
      value: pipe.openingSize.toFixed(2),
      unit: 'in',
      standardRef: `O.D. + ${PIPE_RULES.openingClearance}"`,
    });

    dimensions.push({
      category: `Pipe ${pipe.id.replace('pipe-', '')}`,
      item: 'Angle',
      value: `${pipe.angleDeg.toFixed(1)}`,
      unit: 'deg',
      standardRef: 'CW from North',
    });

    // Pipe annotation
    const pipeAngleRad = (pipe.angleDeg * Math.PI) / 180;
    const labelDist = outerRadius * 1.8;
    annotations.push({
      id: `std-pipe-${pipe.id}`,
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
      value: `${pipe.nominalDiameter}" ${pipe.material} (${pipe.direction})\nOpening: ${pipe.openingSize.toFixed(1)}"\n${pipe.invert > 0 ? `IE: ${pipe.invert}'` : ''}`,
      fontSize: 0,
      rotation: 0,
    });
  }

  // === INVERT DROPS ===
  const outlet = profile.pipes.find((p) => p.direction === 'outlet');
  if (outlet && outlet.invert > 0) {
    for (const pipe of profile.pipes) {
      if (pipe.direction === 'inlet' && pipe.invert > 0) {
        const dropInches = (pipe.invert - outlet.invert) * 12;
        dimensions.push({
          category: `Pipe ${pipe.id.replace('pipe-', '')}`,
          item: 'Invert Drop to Outlet',
          value: dropInches.toFixed(1),
          unit: 'in',
          standardRef: `Min ${PIPE_RULES.minInvertDrop}" required`,
        });
      }
    }
  }

  // === STRUCTURAL LEG VIOLATIONS ===
  for (const v of profile.structuralLegViolations) {
    dimensions.push({
      category: 'Warning',
      item: 'Structural Leg Violation',
      value: v,
      unit: '',
      standardRef: `Min ${PIPE_RULES.minStructuralLeg}" required`,
    });
  }

  if (profile.hasDropConnection) {
    dimensions.push({
      category: 'Note',
      item: 'Drop Connection',
      value: 'External drop connection required',
      unit: '',
      standardRef: `Drop > ${PIPE_RULES.externalDropThreshold}" threshold`,
    });
  }

  return {
    level: 'standard',
    label: 'Standard / Full',
    description: 'All ASTM C478 required dimensions including wall thickness, openings, drops, and structural checks',
    dimensions,
    annotations,
  };
}
