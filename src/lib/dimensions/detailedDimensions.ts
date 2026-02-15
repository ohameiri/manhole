import type { ManholeProfile } from '../../types/manhole';
import type { DimensionSet, DimensionEntry, DimensionAnnotation } from '../../types/dimension';
import { ASTM_C478, PIPE_RULES } from '../standards/astmC478';

export function generateDetailedDimensions(
  profile: ManholeProfile,
  center: { x: number; y: number },
  outerRadius: number
): DimensionSet {
  // Start with standard dimensions, then add engineering details
  const dimensions: DimensionEntry[] = [];
  const annotations: DimensionAnnotation[] = [];

  // === MANHOLE STRUCTURE (Standard + detailed) ===
  dimensions.push(
    { category: 'Manhole', item: 'Diameter', value: profile.diameter, unit: 'in', standardRef: 'ASTM C478' },
    { category: 'Manhole', item: 'Wall Thickness', value: profile.wallThickness, unit: 'in', standardRef: `ASTM C478 (1/12 rule, min ${ASTM_C478.minWallThickness}")` },
    { category: 'Manhole', item: 'Concrete Class', value: 'Class IV or V (4000-5000 psi)', unit: '', standardRef: 'ASTM C478 Sec. 6' },
    { category: 'Manhole', item: 'Reinforcement Cover', value: ASTM_C478.minCover, unit: 'in', standardRef: 'ASTM C478 Sec. 8' },
  );

  if (profile.depth > 0) {
    dimensions.push({ category: 'Manhole', item: 'Depth', value: profile.depth, unit: 'ft', standardRef: '' });
  }
  if (profile.rimElevation > 0) {
    dimensions.push({ category: 'Manhole', item: 'Rim Elevation', value: profile.rimElevation, unit: 'ft', standardRef: '' });
  }
  if (profile.invertElevation > 0) {
    dimensions.push({ category: 'Manhole', item: 'Invert Elevation', value: profile.invertElevation, unit: 'ft', standardRef: '' });
  }

  // Access & top
  dimensions.push(
    { category: 'Manhole', item: 'Access Opening', value: profile.accessOpeningDiameter, unit: 'in', standardRef: `ASTM C478 (min ${ASTM_C478.accessOpeningDiameter}")` },
    { category: 'Manhole', item: 'Cone Type', value: profile.coneType, unit: '', standardRef: 'ASTM C478' },
    { category: 'Manhole', item: 'Cone Height', value: profile.coneType === 'flat' ? 'N/A' : ASTM_C478.cone.eccentricHeight, unit: profile.coneType === 'flat' ? '' : 'in', standardRef: 'ASTM C478' },
    { category: 'Manhole', item: 'Grade Ring Height', value: profile.gradeRingHeight, unit: 'in', standardRef: `Max ${ASTM_C478.maxGradeRingHeight}"` },
  );

  // === JOINTS & WATERPROOFING ===
  dimensions.push(
    { category: 'Joints', item: 'Joint Type', value: 'Tongue & Groove or Bell & Spigot', unit: '', standardRef: 'ASTM C443' },
    { category: 'Joints', item: 'Gasket Material', value: 'Butyl rubber per ASTM C990', unit: '', standardRef: 'ASTM C990' },
    { category: 'Joints', item: 'Pipe-to-Manhole Connector', value: 'Resilient per ASTM C923', unit: '', standardRef: 'ASTM C923' },
  );

  // === LOAD RATINGS ===
  dimensions.push(
    { category: 'Structural', item: 'Design Load', value: 'HS-20 or H-20', unit: '', standardRef: 'AASHTO' },
    { category: 'Structural', item: 'Safety Factor', value: 1.5, unit: '', standardRef: 'ASTM C478' },
  );

  // === CHANNEL & BENCH ===
  if (profile.type === 'sanitary') {
    const benchWidth = profile.diameter > 48 ? 12 : 8;
    dimensions.push(
      { category: 'Channel', item: 'Channel Width', value: 'Match pipe I.D.', unit: '', standardRef: 'Municipal Std' },
      { category: 'Channel', item: 'Channel Depth', value: 'Match pipe crown', unit: '', standardRef: 'Municipal Std' },
      { category: 'Channel', item: 'Bench Width', value: benchWidth, unit: 'in', standardRef: 'Municipal Std' },
      { category: 'Channel', item: 'Bench Slope', value: '1" per foot toward channel', unit: '', standardRef: 'Municipal Std' },
    );
  }

  // === PIPES (Detailed) ===
  for (const pipe of profile.pipes) {
    const prefix = `Pipe ${pipe.id.replace('pipe-', '')}`;
    dimensions.push(
      { category: prefix, item: 'Nominal Size', value: pipe.nominalDiameter, unit: 'in', standardRef: '' },
      { category: prefix, item: 'Material', value: pipe.material, unit: '', standardRef: '' },
      { category: prefix, item: 'Direction', value: pipe.direction, unit: '', standardRef: '' },
      { category: prefix, item: 'Outer Diameter', value: pipe.outerDiameter.toFixed(2), unit: 'in', standardRef: '' },
      { category: prefix, item: 'Opening Size', value: pipe.openingSize.toFixed(2), unit: 'in', standardRef: `O.D. + ${PIPE_RULES.openingClearance}"` },
      { category: prefix, item: 'Angle', value: `${pipe.angleDeg.toFixed(1)}`, unit: 'deg', standardRef: 'CW from North' },
    );

    if (pipe.invert > 0) {
      dimensions.push(
        { category: prefix, item: 'Invert Elevation', value: pipe.invert, unit: 'ft', standardRef: '' },
        { category: prefix, item: 'Crown Elevation', value: (pipe.invert + pipe.nominalDiameter / 12).toFixed(2), unit: 'ft', standardRef: 'Invert + I.D.' },
      );
    }

    // Connector spec
    dimensions.push(
      { category: prefix, item: 'Connector', value: `Resilient connector for ${pipe.nominalDiameter}" ${pipe.material}`, unit: '', standardRef: 'ASTM C923' },
    );
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

        // Crown matching
        const inletCrown = pipe.invert + pipe.nominalDiameter / 12;
        const outletCrown = outlet.invert + outlet.nominalDiameter / 12;
        dimensions.push({
          category: `Pipe ${pipe.id.replace('pipe-', '')}`,
          item: 'Crown Differential',
          value: ((inletCrown - outletCrown) * 12).toFixed(1),
          unit: 'in',
          standardRef: 'Crown matching per municipal std',
        });
      }
    }
  }

  // === TELECOM SPECIFICS ===
  if (profile.type === 'telecom' || profile.type === 'electrical') {
    dimensions.push(
      { category: 'Telecom', item: 'Duct Bank Count', value: profile.pipes.length, unit: 'ducts', standardRef: '' },
      { category: 'Telecom', item: 'Pulling Iron', value: 'Required per spec', unit: '', standardRef: 'NEC 314.29' },
      { category: 'Telecom', item: 'Grounding', value: 'Ground rod + bus bar required', unit: '', standardRef: 'NEC 250' },
    );
  }

  // === CONSTRUCTION NOTES ===
  dimensions.push(
    { category: 'Notes', item: 'Backfill', value: 'Compacted granular fill, 95% Proctor', unit: '', standardRef: 'Municipal Std' },
    { category: 'Notes', item: 'Bedding', value: 'Crushed stone bedding, min 6" depth', unit: '', standardRef: 'Municipal Std' },
    { category: 'Notes', item: 'Waterproofing', value: 'Bituminous coating on exterior', unit: '', standardRef: 'ASTM C478' },
  );

  // === WARNINGS ===
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
      value: 'External drop connection required - concrete encased',
      unit: '',
      standardRef: `Drop > ${PIPE_RULES.externalDropThreshold}" threshold`,
    });
  }

  // === ANNOTATIONS ===

  // Diameter
  annotations.push({
    id: 'det-diameter',
    type: 'linear',
    startPoint: { x: center.x - outerRadius, y: center.y },
    endPoint: { x: center.x + outerRadius, y: center.y },
    offsetDistance: outerRadius * 0.55,
    value: `${profile.diameter}" I.D.`,
    fontSize: 0,
    rotation: 0,
  });

  // Wall + OD
  const od = profile.diameter + profile.wallThickness * 2;
  annotations.push({
    id: 'det-od',
    type: 'linear',
    startPoint: { x: center.x - outerRadius, y: center.y },
    endPoint: { x: center.x + outerRadius, y: center.y },
    offsetDistance: outerRadius * 0.75,
    value: `${od}" O.D. (Wall: ${profile.wallThickness}")`,
    fontSize: 0,
    rotation: 0,
  });

  // Depth + elevations
  annotations.push({
    id: 'det-info',
    type: 'label',
    startPoint: { x: center.x, y: center.y - outerRadius * 2 },
    endPoint: { x: center.x, y: center.y - outerRadius * 2 },
    offsetDistance: 0,
    value: [
      profile.depth > 0 ? `Depth: ${profile.depth}'` : '',
      profile.rimElevation > 0 ? `Rim: ${profile.rimElevation}'` : '',
      profile.invertElevation > 0 ? `Inv: ${profile.invertElevation}'` : '',
      `Cone: ${profile.coneType}`,
      `Access: ${profile.accessOpeningDiameter}" DIA`,
    ].filter(Boolean).join(' | '),
    fontSize: 0,
    rotation: 0,
  });

  // Pipe labels
  for (const pipe of profile.pipes) {
    const pipeAngleRad = (pipe.angleDeg * Math.PI) / 180;
    const labelDist = outerRadius * 2;
    annotations.push({
      id: `det-pipe-${pipe.id}`,
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
      value: [
        `${pipe.nominalDiameter}" ${pipe.material} (${pipe.direction})`,
        `Opening: ${pipe.openingSize.toFixed(1)}"`,
        pipe.invert > 0 ? `IE: ${pipe.invert}' | Crown: ${(pipe.invert + pipe.nominalDiameter / 12).toFixed(2)}'` : '',
        `Connector: ASTM C923`,
      ].filter(Boolean).join('\n'),
      fontSize: 0,
      rotation: 0,
    });
  }

  // Construction notes
  annotations.push({
    id: 'det-notes',
    type: 'note',
    startPoint: { x: center.x - outerRadius * 2, y: center.y - outerRadius * 2.2 },
    endPoint: { x: center.x - outerRadius * 2, y: center.y - outerRadius * 2.2 },
    offsetDistance: 0,
    value: `NOTES: Joints per ASTM C443 | Gasket per ASTM C990 | HS-20 Load Rating | Backfill 95% Proctor`,
    fontSize: 0,
    rotation: 0,
  });

  return {
    level: 'detailed',
    label: 'Detailed / Engineering',
    description: 'Full engineering dimensions with materials, joints, load ratings, construction notes, and crown matching',
    dimensions,
    annotations,
  };
}
