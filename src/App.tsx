import { useAppStore } from './store/store';
import { DropZone } from './components/upload/DropZone';
import { DxfViewer } from './components/viewer/DxfViewer';
import { DimensionOptions } from './components/dimensions/DimensionOptions';
import { DimensionTable } from './components/dimensions/DimensionTable';
import { ExportButton } from './components/export/ExportButton';
import { analyzeManhole, generateDimensions } from './lib/dimensions/dimensionEngine';
import { detectManhole } from './lib/dimensions/manholeDetector';

function App() {
  const {
    step, entities, boundingBox, filename,
    dimensionResult, selectedLevel,
    setManholeProfile, setDimensionResult, setError, resetDxf,
    isLoading,
  } = useAppStore();

  const handleGenerateDimensions = () => {
    try {
      const profile = analyzeManhole(entities);
      if (!profile) {
        setError('Could not detect a manhole in the drawing. Make sure the DXF contains a circular manhole shape.');
        return;
      }
      setManholeProfile(profile);

      const manhole = detectManhole(entities);
      if (!manhole) {
        setError('Could not re-detect manhole geometry after analysis.');
        return;
      }

      const result = generateDimensions(profile, manhole.center, manhole.outerRadius);
      setDimensionResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze dimensions');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <header
        style={{
          padding: '12px 24px',
          backgroundColor: '#1a1a2e',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 700 }}>Manhole Dimensioner</span>
          {filename && (
            <span style={{ fontSize: 13, color: '#aaa' }}>
              {filename}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {step !== 'upload' && (
            <button
              onClick={resetDxf}
              style={{
                padding: '6px 16px',
                backgroundColor: 'transparent',
                color: '#aaa',
                border: '1px solid #555',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              New File
            </button>
          )}
          {step === 'viewer' && (
            <button
              onClick={handleGenerateDimensions}
              style={{
                padding: '6px 16px',
                backgroundColor: '#4472C4',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Generate Dimensions
            </button>
          )}
          {step === 'dimensions' && <ExportButton />}
        </div>
      </header>

      {/* Loading overlay */}
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div style={{ padding: 24, backgroundColor: '#fff', borderRadius: 12, fontSize: 16 }}>
            Processing...
          </div>
        </div>
      )}

      {/* Main content */}
      <main>
        {step === 'upload' && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <DropZone />
          </div>
        )}

        {(step === 'viewer' || step === 'dimensions') && boundingBox && (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 52px)' }}>
            {/* Viewer area */}
            <div
              style={{
                flex: dimensionResult ? '0 0 55%' : 1,
                position: 'relative',
                borderBottom: dimensionResult ? '2px solid #ddd' : 'none',
              }}
            >
              <DxfViewer />
            </div>

            {/* Dimensions panel */}
            {dimensionResult && (
              <div
                style={{
                  flex: '0 0 45%',
                  overflow: 'auto',
                  padding: 20,
                  backgroundColor: '#fff',
                }}
              >
                <DimensionOptions />
                {selectedLevel && <DimensionTable />}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
