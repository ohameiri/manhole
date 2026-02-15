import { EntityRenderer } from './EntityRenderer';
import type { DenormalizedEntity, BoundingBox } from '../../types/dxf';

interface Props {
  entities: DenormalizedEntity[];
  visibleLayers: string[];
  boundingBox: BoundingBox;
  children?: React.ReactNode;
}

export function SvgRenderer({ entities, visibleLayers, children }: Props) {
  const visibleEntities = entities.filter(
    (e) => !e.layer || visibleLayers.includes(e.layer)
  );

  return (
    <g transform="scale(1, -1)">
      {visibleEntities.map((entity, i) => (
        <EntityRenderer key={i} entity={entity} />
      ))}
      {children}
    </g>
  );
}
