import { useState } from 'react';
import { useAppStore } from '../../store/store';
import { svgToPng } from '../../lib/export/svgToImage';
import { exportToExcel } from '../../lib/export/excelBuilder';

export function ExportButton() {
  const { dimensionResult, selectedLevel, filename } = useAppStore();
  const [exporting, setExporting] = useState(false);

  if (!dimensionResult || !selectedLevel) return null;

  const handleExport = async () => {
    setExporting(true);
    try {
      const dims = dimensionResult[selectedLevel].dimensions;

      // Capture SVG as PNG
      let pngBlob: Blob | null = null;
      const svgEl = document.getElementById('dxf-viewer-svg') as unknown as SVGSVGElement;
      if (svgEl) {
        try {
          pngBlob = await svgToPng(svgEl, 2400, 1800);
        } catch {
          console.warn('Failed to capture SVG preview for Excel');
        }
      }

      await exportToExcel(dims, pngBlob, filename || 'manhole');
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      style={{
        padding: '10px 24px',
        backgroundColor: exporting ? '#aaa' : '#27ae60',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        cursor: exporting ? 'wait' : 'pointer',
        transition: 'background-color 0.2s',
      }}
    >
      {exporting ? 'Exporting...' : 'Export to Excel'}
    </button>
  );
}
