declare module 'dxf' {
  export class Helper {
    constructor(contents: string);
    parsed: Record<string, unknown>;
    denormalised: Record<string, unknown>[];
  }
  export const colors: number[][];
  export function parseString(contents: string): Record<string, unknown>;
  export function denormalise(parsed: Record<string, unknown>): Record<string, unknown>[];
}
