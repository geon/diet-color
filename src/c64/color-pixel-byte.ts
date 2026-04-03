import type { Tuple } from "../tuple.js";

export type SubPaletteIndex = 0 | 1 | 2 | 3;

export type ColorPixelByte = Tuple<SubPaletteIndex, 4>;

export function parseColorPixelByte(byte: number): ColorPixelByte {
	return [
		((byte >> 6) & 0b11) as SubPaletteIndex,
		((byte >> 4) & 0b11) as SubPaletteIndex,
		((byte >> 2) & 0b11) as SubPaletteIndex,
		((byte >> 0) & 0b11) as SubPaletteIndex,
	];
}

export function serializeColorPixelByte(colorIndices: ColorPixelByte): number {
	return (
		(colorIndices[0] << 6) +
		(colorIndices[1] << 4) +
		(colorIndices[2] << 2) +
		(colorIndices[3] << 0)
	);
}
