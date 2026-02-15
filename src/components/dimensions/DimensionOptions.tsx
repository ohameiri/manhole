import { DimensionCard } from './DimensionCard';
import { useAppStore } from '../../store/store';
import type { DimensionLevel } from '../../types/dimension';

export function DimensionOptions() {
  const { dimensionResult, selectedLevel, setSelectedLevel } = useAppStore();

  if (!dimensionResult) return null;

  const levels: DimensionLevel[] = ['compact', 'standard', 'detailed'];

  return (
    <div>
      <h2 style={{ fontSize: 18, margin: '0 0 16px', color: '#1a1a2e' }}>
        Choose Dimensioning Level
      </h2>
      <div style={{ display: 'flex', gap: 16 }}>
        {levels.map((level) => (
          <DimensionCard
            key={level}
            dimensionSet={dimensionResult[level]}
            isSelected={selectedLevel === level}
            onSelect={() => setSelectedLevel(level)}
          />
        ))}
      </div>
    </div>
  );
}
