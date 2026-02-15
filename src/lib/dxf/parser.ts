import { Helper } from 'dxf';
import type { ParsedDxf, DenormalizedEntity } from '../../types/dxf';

export interface ParseResult {
  parsed: ParsedDxf;
  entities: DenormalizedEntity[];
  layers: string[];
}

function normalizeEntity(e: Record<string, unknown>): Record<string, unknown> {
  const out = { ...e };

  if (e.type === 'CIRCLE' || e.type === 'ARC' || e.type === 'ELLIPSE') {
    if (e.x != null || e.y != null) {
      out.center = { x: e.x ?? 0, y: e.y ?? 0 };
    }
    if (e.type === 'CIRCLE' || e.type === 'ARC') {
      if (e.r != null) out.radius = e.r;
    }
    if (e.type === 'ARC') {
      if (e.startAngle != null) out.startAngle = (e.startAngle as number) * 180 / Math.PI;
      if (e.endAngle != null)   out.endAngle   = (e.endAngle   as number) * 180 / Math.PI;
    }
  }

  if (e.type === 'TEXT' || e.type === 'MTEXT' || e.type === 'POINT') {
    if (e.x != null || e.y != null) {
      out.position = { x: e.x ?? 0, y: e.y ?? 0 };
    }
    if (e.type === 'TEXT' || e.type === 'MTEXT') {
      if (e.string != null) out.text = e.string;
      out.height = (e as Record<string, number>).textHeight
               ?? (e as Record<string, number>).nominalTextHeight
               ?? 1;
      if (e.type === 'MTEXT' && (e.xAxisX != null || e.xAxisY != null)) {
        out.rotation = Math.atan2(
          (e.xAxisY as number) ?? 0,
          (e.xAxisX as number) ?? 1
        ) * 180 / Math.PI;
      }
    }
  }

  return out;
}

export function parseDxfText(text: string): ParseResult {
  const helper = new Helper(text);

  const parsed = helper.parsed as unknown as ParsedDxf;
  const entities = ((helper.denormalised || []) as unknown as Record<string, unknown>[])
    .map(normalizeEntity) as unknown as DenormalizedEntity[];

  // Extract unique layer names
  const layerSet = new Set<string>();
  for (const e of entities) {
    if (e.layer) layerSet.add(e.layer);
  }
  const layers = Array.from(layerSet).sort();

  return { parsed, entities, layers };
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function isBinaryDxf(text: string): boolean {
  return text.startsWith('AutoCAD Binary DXF');
}
