import { useAppStore } from '../../store/store';

export function DimensionTable() {
  const { dimensionResult, selectedLevel } = useAppStore();

  if (!dimensionResult || !selectedLevel) return null;

  const dims = dimensionResult[selectedLevel].dimensions;

  return (
    <div style={{ marginTop: 20, maxHeight: 400, overflow: 'auto' }}>
      <h3 style={{ fontSize: 16, margin: '0 0 12px', color: '#1a1a2e' }}>
        Dimension Table ({dims.length} items)
      </h3>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 13,
          backgroundColor: '#fff',
        }}
      >
        <thead>
          <tr>
            {['Category', 'Item', 'Value', 'Unit', 'Standard Reference'].map((h) => (
              <th
                key={h}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#4472C4',
                  color: '#fff',
                  textAlign: 'left',
                  fontWeight: 600,
                  position: 'sticky',
                  top: 0,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dims.map((d, i) => (
            <tr
              key={i}
              style={{
                backgroundColor: i % 2 === 0 ? '#f3f6fb' : '#fff',
              }}
            >
              <td style={{ padding: '6px 12px', fontWeight: 500 }}>{d.category}</td>
              <td style={{ padding: '6px 12px' }}>{d.item}</td>
              <td style={{ padding: '6px 12px', fontWeight: 600 }}>{String(d.value)}</td>
              <td style={{ padding: '6px 12px', color: '#666' }}>{d.unit}</td>
              <td style={{ padding: '6px 12px', color: '#888', fontSize: 12 }}>{d.standardRef}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
