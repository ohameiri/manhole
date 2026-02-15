import { Helper } from 'dxf';
import type { ParsedDxf, DenormalizedEntity } from '../../types/dxf';

export interface ParseResult {
  parsed: ParsedDxf;
  entities: DenormalizedEntity[];
  layers: string[];
}

export function parseDxfText(text: string): ParseResult {
  const helper = new Helper(text);

  const parsed = helper.parsed as unknown as ParsedDxf;
  const entities = (helper.denormalised || []) as unknown as DenormalizedEntity[];

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
