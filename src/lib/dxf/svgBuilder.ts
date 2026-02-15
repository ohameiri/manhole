// SVG builder utilities for DXF entity conversion

export function describeArc(
  cx: number, cy: number, r: number,
  startAngleDeg: number, endAngleDeg: number
): string {
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

export function polylineToPath(
  vertices: Array<{ x: number; y: number; bulge?: number }>,
  closed: boolean
): string {
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
