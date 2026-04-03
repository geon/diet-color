import type { Image } from "../image.js";
import type { Tuple } from "../tuple.js";
import type { Char } from "./char.js";

export type MulticolorBitmapChar = {
	readonly char: Char;
	/** 0-15 */
	readonly screenColors: Tuple<number, 2>;
	/** 0-7 */
	readonly colorRam: number;
};

/**
 * Must have a size of 40x25.
 */
export type MulticolorBitmap = Image<MulticolorBitmapChar> & {
	/** 0-15 */
	readonly bgColor: number;
};
