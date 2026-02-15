export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface BoundingBox {
  min: Point2D;
  max: Point2D;
  width: number;
  height: number;
}

export interface DxfEntity {
  type: string;
  layer?: string;
  colorNumber?: number;
  lineType?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface ParsedDxf {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  header: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tables: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks: Record<string, any>;
  entities: DxfEntity[];
}

export interface DenormalizedEntity extends DxfEntity {
  // Flattened entity with block transforms applied
}

export interface DxfFileInfo {
  filename: string;
  fileSize: number;
  entityCount: number;
  layerNames: string[];
  boundingBox: BoundingBox;
}
