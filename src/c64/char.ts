import type { Tuple } from "../tuple.js";
import {
	type ColorPixelByte,
	serializeColorPixelByte,
} from "./color-pixel-byte.js";

export type Char = Tuple<ColorPixelByte, 8>;

export function serializeChar(char: Char) {
	return char.map(serializeColorPixelByte);
}
