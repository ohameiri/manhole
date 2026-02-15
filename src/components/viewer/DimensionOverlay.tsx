import type { DimensionAnnotation } from '../../types/dimension';
import type { FontSizeConfig } from '../../lib/dxf/textScaler';

interface Props {
  annotations: DimensionAnnotation[];
  fontConfig: FontSizeConfig;
}

function renderArrow(
  x: number, y: number, angle: number, size: number
): string {
  const rad = (angle * Math.PI) / 180;
  const dx1 = size * Math.cos(rad + 0.4);
  const dy1 = size * Math.sin(rad + 0.4);
  const dx2 = size * Math.cos(rad - 0.4);
  const dy2 = size * Math.sin(rad - 0.4);
  return `M ${x} ${y} L ${x - dx1} ${y - dy1} M ${x} ${y} L ${x - dx2} ${y - dy2}`;
}

export function DimensionOverlay({ annotations, fontConfig }: Props) {
  return (
    <g className="dimension-overlay" transform="scale(1, -1)">
      {annotations.map((ann) => {
        const dx = ann.endPoint.x - ann.startPoint.x;
        const dy = ann.endPoint.y - ann.startPoint.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        // Perpendicular offset for dimension line
        const perpAngle = ((angle + 90) * Math.PI) / 180;
        const offsetX = ann.offsetDistance * Math.cos(perpAngle);
        const offsetY = ann.offsetDistance * Math.sin(perpAngle);

        const dimStart = {
          x: ann.startPoint.x + offsetX,
          y: ann.startPoint.y + offsetY,
        };
        const dimEnd = {
          x: ann.endPoint.x + offsetX,
          y: ann.endPoint.y + offsetY,
        };
        const midX = (dimStart.x + dimEnd.x) / 2;
        const midY = (dimStart.y + dimEnd.y) / 2;

        if (ann.type === 'label' || ann.type === 'note') {
          const fs = ann.type === 'note' ? fontConfig.noteText : fontConfig.annotationText;
          return (
            <g key={ann.id}>
              <text
                x={ann.startPoint.x}
                y={-ann.startPoint.y}
                fontSize={fs}
                fill="#c0392b"
                fontFamily="Arial, sans-serif"
                dominantBaseline="middle"
              >
                {ann.value}
              </text>
            </g>
          );
        }

        const arrowAngleRad = Math.atan2(dy, dx);
        const arrowAngleDeg = (arrowAngleRad * 180) / Math.PI;

        return (
          <g key={ann.id}>
            {/* Extension lines */}
            <line
              x1={ann.startPoint.x} y1={-ann.startPoint.y}
              x2={dimStart.x} y2={-dimStart.y}
              stroke="#4472C4" strokeWidth={fontConfig.lineWidth} strokeDasharray={`${fontConfig.lineWidth * 4}`}
            />
            <line
              x1={ann.endPoint.x} y1={-ann.endPoint.y}
              x2={dimEnd.x} y2={-dimEnd.y}
              stroke="#4472C4" strokeWidth={fontConfig.lineWidth} strokeDasharray={`${fontConfig.lineWidth * 4}`}
            />
            {/* Dimension line */}
            <line
              x1={dimStart.x} y1={-dimStart.y}
              x2={dimEnd.x} y2={-dimEnd.y}
              stroke="#4472C4" strokeWidth={fontConfig.lineWidth}
            />
            {/* Arrows */}
            <path
              d={renderArrow(dimStart.x, -dimStart.y, arrowAngleDeg, fontConfig.arrowSize)}
              stroke="#4472C4" strokeWidth={fontConfig.lineWidth} fill="none"
            />
            <path
              d={renderArrow(dimEnd.x, -dimEnd.y, arrowAngleDeg + 180, fontConfig.arrowSize)}
              stroke="#4472C4" strokeWidth={fontConfig.lineWidth} fill="none"
            />
            {/* Text background */}
            {length > 0 && (
              <>
                <rect
                  x={midX - ann.value.length * fontConfig.dimensionText * 0.3}
                  y={-midY - fontConfig.dimensionText * 0.6}
                  width={ann.value.length * fontConfig.dimensionText * 0.6}
                  height={fontConfig.dimensionText * 1.2}
                  fill="white" fillOpacity={0.85}
                />
                <text
                  x={midX}
                  y={-midY}
                  fontSize={fontConfig.dimensionText}
                  fill="#c0392b"
                  fontFamily="Arial, sans-serif"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {ann.value}
                </text>
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}
