import type { Coord2 } from "./coord2.js";

export type Image<TPixel> = {
	readonly size: Coord2;
	readonly pixels: readonly TPixel[];
};
