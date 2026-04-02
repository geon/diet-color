import { indexToCoord2, type Coord2 } from "./coord2.js";

export type Image<TPixel> = {
	readonly size: Coord2;
	readonly pixels: readonly TPixel[];
};

export function imageMap<In, Out>(
	image: Image<In>,
	transform: (color: In, position: Coord2) => Out,
): Image<Out> {
	return {
		...image,
		pixels: image.pixels.map((color, index) =>
			transform(color, indexToCoord2(image.size, index)),
		),
	};
}
