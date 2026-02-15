import type { DenormalizedEntity } from '../../types/dxf';

// DXF ACI color table (basic colors)
const ACI_COLORS: Record<number, string> = {
  0: '#000000', 1: '#FF0000', 2: '#FFFF00', 3: '#00FF00',
  4: '#00FFFF', 5: '#0000FF', 6: '#FF00FF', 7: '#000000',
  8: '#808080', 9: '#C0C0C0',
};

function getColor(entity: DenormalizedEntity): string {
  if (entity.colorNumber && ACI_COLORS[entity.colorNumber]) {
    return ACI_COLORS[entity.colorNumber];
  }
  return '#333333';
}

function describeArc(
  cx: number, cy: number, r: number,
  startAngleDeg: number, endAngleDeg: number
): string {
  // DXF angles: counterclockwise from +X axis, in degrees
  const startRad = (startAngleDeg * Math.PI) / 180;
  const endRad = (endAngleDeg * Math.PI) / 180;

  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);

  let sweep = endAngleDeg - startAngleDeg;
  if (sweep < 0) sweep += 360;
  const largeArc = sweep > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

function polylineToPath(vertices: Array<{ x: number; y: number; bulge?: number }>, closed: boolean): string {
  if (!vertices || vertices.length === 0) return '';

  let d = `M ${vertices[0].x} ${vertices[0].y}`;

  for (let i = 0; i < vertices.length - 1; i++) {
    const curr = vertices[i];
    const next = vertices[i + 1];

    if (curr.bulge && Math.abs(curr.bulge) > 0.001) {
      d += bulgeArc(curr, next, curr.bulge);
    } else {
      d += ` L ${next.x} ${next.y}`;
    }
  }

  if (closed && vertices.length > 1) {
    const last = vertices[vertices.length - 1];
    const first = vertices[0];
    if (last.bulge && Math.abs(last.bulge) > 0.001) {
      d += bulgeArc(last, first, last.bulge);
    } else {
      d += ' Z';
    }
  }

  return d;
}

function bulgeArc(
  from: { x: number; y: number },
  to: { x: number; y: number },
  bulge: number
): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const chord = Math.sqrt(dx * dx + dy * dy);
  const sagitta = Math.abs(bulge) * chord / 2;
  const radius = (chord * chord / 4 + sagitta * sagitta) / (2 * sagitta);
  const largeArc = Math.abs(bulge) > 1 ? 1 : 0;
  const sweep = bulge > 0 ? 1 : 0;

  return ` A ${radius} ${radius} 0 ${largeArc} ${sweep} ${to.x} ${to.y}`;
}

interface Props {
  entity: DenormalizedEntity;
}

export function EntityRenderer({ entity }: Props) {
  const color = getColor(entity);
  const strokeWidth = 0.5;

  switch (entity.type) {
    case 'LINE':
      if (!entity.start || !entity.end) return null;
      return (
        <line
          x1={entity.start.x} y1={entity.start.y}
          x2={entity.end.x} y2={entity.end.y}
          stroke={color} strokeWidth={strokeWidth} fill="none"
        />
      );

    case 'CIRCLE':
      if (!entity.center || entity.radius == null) return null;
      return (
        <circle
          cx={entity.center.x} cy={entity.center.y} r={entity.radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
        />
      );

    case 'ARC':
      if (!entity.center || entity.radius == null) return null;
      return (
        <path
          d={describeArc(
            entity.center.x, entity.center.y, entity.radius,
            entity.startAngle || 0, entity.endAngle || 360
          )}
          stroke={color} strokeWidth={strokeWidth} fill="none"
        />
      );

    case 'ELLIPSE':
      if (!entity.center) return null;
      {
        const mx = entity.majorX || 1;
        const my = entity.majorY || 0;
        const majorLen = Math.sqrt(mx * mx + my * my);
        const ratio = entity.axisRatio || 1;
        const minorLen = majorLen * ratio;
        const rotation = (Math.atan2(my, mx) * 180) / Math.PI;
        return (
          <ellipse
            cx={entity.center.x} cy={entity.center.y}
            rx={majorLen} ry={minorLen}
            transform={`rotate(${rotation} ${entity.center.x} ${entity.center.y})`}
            stroke={color} strokeWidth={strokeWidth} fill="none"
          />
        );
      }

    case 'LWPOLYLINE':
    case 'POLYLINE':
      if (!entity.vertices || entity.vertices.length === 0) return null;
      return (
        <path
          d={polylineToPath(entity.vertices, !!entity.closed)}
          stroke={color} strokeWidth={strokeWidth} fill="none"
        />
      );

    case 'SPLINE':
      if (!entity.controlPoints || entity.controlPoints.length === 0) return null;
      {
        // Approximate spline as polyline through control points
        const pts = entity.controlPoints;
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
          d += ` L ${pts[i].x} ${pts[i].y}`;
        }
        return <path d={d} stroke={color} strokeWidth={strokeWidth} fill="none" />;
      }

    case 'TEXT':
      if (!entity.position) return null;
      {
        const height = entity.height || 1;
        const rotation = entity.rotation || 0;
        return (
          <text
            x={entity.position.x}
            y={entity.position.y}
            fontSize={height}
            fill={color}
            transform={`scale(1,-1) translate(0, ${-2 * entity.position.y}) rotate(${-rotation} ${entity.position.x} ${entity.position.y})`}
            dominantBaseline="alphabetic"
            fontFamily="Arial, sans-serif"
          >
            {entity.text || ''}
          </text>
        );
      }

    case 'MTEXT':
      if (!entity.position) return null;
      {
        const h = entity.height || 1;
        const rot = entity.rotation || 0;
        // Strip basic MTEXT formatting codes
        const cleanText = (entity.text || '')
          .replace(/\\P/g, '\n')
          .replace(/\\[A-Za-z][^;]*;/g, '')
          .replace(/[{}]/g, '');
        return (
          <text
            x={entity.position.x}
            y={entity.position.y}
            fontSize={h}
            fill={color}
            transform={`scale(1,-1) translate(0, ${-2 * entity.position.y}) rotate(${-rot} ${entity.position.x} ${entity.position.y})`}
            dominantBaseline="alphabetic"
            fontFamily="Arial, sans-serif"
          >
            {cleanText.split('\n').map((line: string, i: number) => (
              <tspan key={i} x={entity.position.x} dy={i === 0 ? 0 : h}>
                {line}
              </tspan>
            ))}
          </text>
        );
      }

    case 'POINT':
      if (!entity.position) return null;
      return (
        <circle
          cx={entity.position.x} cy={entity.position.y} r={strokeWidth}
          fill={color}
        />
      );

    case 'SOLID':
    case '3DFACE':
      {
        const pts = [entity.point1, entity.point2, entity.point3, entity.point4].filter(Boolean);
        if (pts.length < 3) return null;
        const d = `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((p: { x: number; y: number }) => `L ${p.x} ${p.y}`).join(' ') + ' Z';
        return <path d={d} stroke={color} strokeWidth={strokeWidth} fill={color} fillOpacity={0.3} />;
      }

    default:
      return null;
  }
}
