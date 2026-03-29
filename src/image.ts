import type { Coord2 } from "./coord2.js";

export type Image<TPixel> = {
	readonly size: Coord2;
	readonly pixels: readonly TPixel[];
};

export function imageMap<In, Out>(
	image: Image<In>,
	transform: (pixel: In) => Out,
): Image<Out> {
	return {
		...image,
		pixels: image.pixels.map(transform),
	};
}
