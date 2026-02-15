import type { DimensionSet } from '../../types/dimension';

interface Props {
  dimensionSet: DimensionSet;
  isSelected: boolean;
  onSelect: () => void;
}

export function DimensionCard({ dimensionSet, isSelected, onSelect }: Props) {
  const dimCount = dimensionSet.dimensions.length;
  const annCount = dimensionSet.annotations.length;

  return (
    <div
      onClick={onSelect}
      style={{
        flex: 1,
        border: `2px solid ${isSelected ? '#4472C4' : '#ddd'}`,
        borderRadius: 12,
        padding: 20,
        cursor: 'pointer',
        backgroundColor: isSelected ? '#e8f0fe' : '#fff',
        transition: 'all 0.2s',
        minWidth: 200,
      }}
    >
      <h3 style={{ margin: '0 0 8px', fontSize: 16, color: isSelected ? '#4472C4' : '#333' }}>
        {dimensionSet.label}
      </h3>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#666', lineHeight: 1.4 }}>
        {dimensionSet.description}
      </p>
      <div style={{ fontSize: 12, color: '#888' }}>
        <div>{dimCount} dimensions</div>
        <div>{annCount} annotations on drawing</div>
      </div>
      {isSelected && (
        <div
          style={{
            marginTop: 12,
            padding: '6px 12px',
            backgroundColor: '#4472C4',
            color: '#fff',
            borderRadius: 6,
            fontSize: 13,
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          Selected
        </div>
      )}
    </div>
  );
}
