interface Props {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const btnStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  border: '1px solid #ccc',
  borderRadius: 8,
  backgroundColor: '#fff',
  fontSize: 18,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export function ViewerControls({ onZoomIn, onZoomOut, onReset }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        zIndex: 10,
      }}
    >
      <button style={btnStyle} onClick={onZoomIn} title="Zoom In">+</button>
      <button style={btnStyle} onClick={onZoomOut} title="Zoom Out">-</button>
      <button style={{ ...btnStyle, fontSize: 14 }} onClick={onReset} title="Fit to View">
        Fit
      </button>
    </div>
  );
}
