import type { BoundingBox, DenormalizedEntity } from '../../types/dxf';

export function calculateBoundingBox(entities: DenormalizedEntity[]): BoundingBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  function expand(x: number, y: number) {
    if (isFinite(x) && isFinite(y)) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  for (const e of entities) {
    switch (e.type) {
      case 'LINE':
        if (e.start && e.end) {
          expand(e.start.x, e.start.y);
          expand(e.end.x, e.end.y);
        }
        break;

      case 'CIRCLE':
        if (e.center && e.radius != null) {
          expand(e.center.x - e.radius, e.center.y - e.radius);
          expand(e.center.x + e.radius, e.center.y + e.radius);
        }
        break;

      case 'ARC':
        if (e.center && e.radius != null) {
          // Conservative: use full circle bounds for arcs
          expand(e.center.x - e.radius, e.center.y - e.radius);
          expand(e.center.x + e.radius, e.center.y + e.radius);
        }
        break;

      case 'ELLIPSE':
        if (e.center && e.majorX != null && e.majorY != null) {
          const majorLen = Math.sqrt(e.majorX * e.majorX + e.majorY * e.majorY);
          expand(e.center.x - majorLen, e.center.y - majorLen);
          expand(e.center.x + majorLen, e.center.y + majorLen);
        }
        break;

      case 'LWPOLYLINE':
      case 'POLYLINE':
        if (e.vertices) {
          for (const v of e.vertices) {
            expand(v.x, v.y);
          }
        }
        break;

      case 'SPLINE':
        if (e.controlPoints) {
          for (const p of e.controlPoints) {
            expand(p.x, p.y);
          }
        }
        break;

      case 'TEXT':
      case 'MTEXT':
        if (e.position) {
          expand(e.position.x, e.position.y);
          // Rough estimate for text extent
          const textLen = (e.text?.length || 5) * (e.height || 1) * 0.6;
          expand(e.position.x + textLen, e.position.y + (e.height || 1));
        }
        break;

      case 'POINT':
        if (e.position) {
          expand(e.position.x, e.position.y);
        }
        break;

      case 'SOLID':
      case '3DFACE':
        for (const key of ['point1', 'point2', 'point3', 'point4']) {
          if (e[key]) expand(e[key].x, e[key].y);
        }
        break;

      case 'DIMENSION':
        // Dimension entities have various definition points
        for (const key of [
          'anchorPoint',
          'middleOfText',
          'insertionPoint',
          'linearOrAngularPoint1',
          'linearOrAngularPoint2',
        ]) {
          if (e[key]) expand(e[key].x, e[key].y);
        }
        break;

      default:
        // Try common point properties
        if (e.position) expand(e.position.x, e.position.y);
        if (e.center) expand(e.center.x, e.center.y);
        if (e.start) expand(e.start.x, e.start.y);
        if (e.end) expand(e.end.x, e.end.y);
        break;
    }
  }

  // Fallback if no entities
  if (!isFinite(minX)) {
    minX = 0; minY = 0; maxX = 100; maxY = 100;
  }

  // Add padding (5%)
  const padX = (maxX - minX) * 0.05 || 5;
  const padY = (maxY - minY) * 0.05 || 5;

  return {
    min: { x: minX - padX, y: minY - padY },
    max: { x: maxX + padX, y: maxY + padY },
    width: maxX - minX + padX * 2,
    height: maxY - minY + padY * 2,
  };
}
