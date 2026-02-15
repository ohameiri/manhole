import { useCallback } from 'react';
import { useAppStore } from '../store/store';
import { parseDxfText, readFileAsText, isBinaryDxf } from '../lib/dxf/parser';
import { calculateBoundingBox } from '../lib/dxf/boundingBox';

export function useDxfParser() {
  const { setDxfData, setLoading, setError } = useAppStore();

  const parseFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);

      try {
        const text = await readFileAsText(file);

        if (isBinaryDxf(text)) {
          throw new Error(
            'Binary DXF files are not supported. Please export as ASCII DXF from your CAD software.'
          );
        }

        const { parsed, entities, layers } = parseDxfText(text);

        if (entities.length === 0) {
          throw new Error('No entities found in the DXF file. The file may be empty or corrupted.');
        }

        const bbox = calculateBoundingBox(entities);
        setDxfData(file.name, text, parsed, entities, bbox, layers);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to parse DXF file';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [setDxfData, setLoading, setError]
  );

  return { parseFile };
}
