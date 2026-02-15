import { useState, useCallback, useRef, type WheelEvent, type MouseEvent } from 'react';
import type { BoundingBox } from '../types/dxf';


export function useDxfViewer(bbox: BoundingBox | null) {
  const defaultVB = bbox
    ? { x: bbox.min.x, y: -bbox.max.y, w: bbox.width, h: bbox.height }
    : { x: 0, y: 0, w: 100, h: 100 };

  const [viewBox, setViewBox] = useState(defaultVB);
  const panStart = useRef<{ x: number; y: number; vbX: number; vbY: number } | null>(null);

  const resetView = useCallback(() => {
    if (bbox) {
      setViewBox({ x: bbox.min.x, y: -bbox.max.y, w: bbox.width, h: bbox.height });
    }
  }, [bbox]);

  const handleWheel = useCallback(
    (e: WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.15 : 0.85;
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      setViewBox((vb) => {
        const newW = vb.w * factor;
        const newH = vb.h * factor;
        return {
          x: vb.x + (vb.w - newW) * mx,
          y: vb.y + (vb.h - newH) * my,
          w: newW,
          h: newH,
        };
      });
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (e.button === 0) {
        panStart.current = { x: e.clientX, y: e.clientY, vbX: viewBox.x, vbY: viewBox.y };
      }
    },
    [viewBox]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (!panStart.current) return;
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const dx = ((e.clientX - panStart.current.x) / rect.width) * viewBox.w;
      const dy = ((e.clientY - panStart.current.y) / rect.height) * viewBox.h;
      setViewBox((vb) => ({
        ...vb,
        x: panStart.current!.vbX - dx,
        y: panStart.current!.vbY - dy,
      }));
    },
    [viewBox.w, viewBox.h]
  );

  const handleMouseUp = useCallback(() => {
    panStart.current = null;
  }, []);

  const zoomIn = useCallback(() => {
    setViewBox((vb) => ({
      x: vb.x + vb.w * 0.1,
      y: vb.y + vb.h * 0.1,
      w: vb.w * 0.8,
      h: vb.h * 0.8,
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewBox((vb) => ({
      x: vb.x - vb.w * 0.125,
      y: vb.y - vb.h * 0.125,
      w: vb.w * 1.25,
      h: vb.h * 1.25,
    }));
  }, []);

  return {
    viewBox,
    resetView,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomIn,
    zoomOut,
  };
}
