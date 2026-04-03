import { coord2Equal } from "../coord2";
import { serializeChar } from "./char";
import type { MulticolorBitmap } from "./multicolor-bitmap";
import { screenSize } from "./screen-size";

export function koalaSerialize(
	bitmap: MulticolorBitmap,
): Uint8Array | undefined {
	if (!coord2Equal(bitmap.size, screenSize)) {
		return undefined;
	}

	return new Uint8Array([
		0x00,
		0x60,
		...bitmap.pixels.flatMap((tile) => serializeChar(tile.char)),
		...bitmap.pixels.flatMap(
			(tile) =>
				(tile.screenColors[0] << 4) | //
				(tile.screenColors[1] << 0),
		),
		...bitmap.pixels.flatMap((tile) => tile.colorRam),
		bitmap.bgColor,
	]);
}
