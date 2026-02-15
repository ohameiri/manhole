import { useEffect, useRef } from 'react';
import { SvgRenderer } from './SvgRenderer';
import { ViewerControls } from './ViewerControls';
import { DimensionOverlay } from './DimensionOverlay';
import { useDxfViewer } from '../../hooks/useDxfViewer';
import { useAppStore } from '../../store/store';
import { calculateFontSizes } from '../../lib/dxf/textScaler';

export function DxfViewer() {
  const { entities, boundingBox, visibleLayers, dimensionResult, selectedLevel } = useAppStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const {
    viewBox, resetView,
    handleWheel, handleMouseDown, handleMouseMove, handleMouseUp,
    zoomIn, zoomOut,
  } = useDxfViewer(boundingBox);

  useEffect(() => {
    resetView();
  }, [boundingBox, resetView]);

  if (!boundingBox) return null;

  const selectedSet = selectedLevel && dimensionResult ? dimensionResult[selectedLevel] : null;
  const fontConfig = selectedLevel && boundingBox
    ? calculateFontSizes(boundingBox, selectedLevel)
    : null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#f9f9f9' }}>
      <ViewerControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetView} />
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: 'grab', display: 'block' }}
        id="dxf-viewer-svg"
      >
        <SvgRenderer
          entities={entities}
          visibleLayers={visibleLayers}
          boundingBox={boundingBox}
        />
        {selectedSet && fontConfig && (
          <DimensionOverlay
            annotations={selectedSet.annotations}
            fontConfig={fontConfig}
          />
        )}
      </svg>
    </div>
  );
}
