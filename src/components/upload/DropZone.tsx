import { useCallback, useState, useRef, type DragEvent } from 'react';
import { useDxfParser } from '../../hooks/useDxfParser';
import { useAppStore } from '../../store/store';

export function DropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { parseFile } = useDxfParser();
  const { isLoading, error } = useAppStore();

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith('.dxf')) {
        useAppStore.getState().setError('Please upload a .dxf file');
        return;
      }
      parseFile(file);
    },
    [parseFile]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>
        Manhole Butterfly Diagram Dimensioner
      </h1>
      <p style={{ color: '#666', maxWidth: 500, textAlign: 'center' }}>
        Upload a DXF file of a manhole butterfly diagram. The tool will analyze the drawing,
        apply ASTM C478 dimensioning standards, and let you export to Excel.
      </p>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{
          width: 460,
          height: 260,
          border: `3px dashed ${isDragging ? '#4472C4' : '#ccc'}`,
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: isDragging ? '#e8f0fe' : '#fafafa',
          transition: 'all 0.2s',
        }}
      >
        {isLoading ? (
          <div style={{ color: '#4472C4', fontSize: 18 }}>Parsing DXF file...</div>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>&#128206;</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#333' }}>
              Drop DXF file here
            </div>
            <div style={{ fontSize: 14, color: '#888', marginTop: 8 }}>
              or click to browse
            </div>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".dxf"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && (
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: '#fde8e8',
            color: '#c0392b',
            borderRadius: 8,
            maxWidth: 460,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
