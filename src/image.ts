import { coord2ToIndex, indexToCoord2, type Coord2 } from "./coord2.js";
import { range } from "./functions.js";

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

export function imageDoubleWidth<T>(image: Image<T>): Image<T> {
	return {
		size: { ...image.size, x: image.size.x * 2 },
		pixels: image.pixels.flatMap((x) => [x, x]),
	};
}

export function imageHalfWidth<T>(image: Image<T>): Image<T> {
	const halfWidthSize = { ...image.size, x: Math.floor(image.size.x / 2) };
	return {
		size: halfWidthSize,
		pixels: range(halfWidthSize.x * halfWidthSize.y).map((halfWidthIndex) => {
			const halfWidthPos = indexToCoord2(halfWidthSize, halfWidthIndex);
			const fullWidthPos = { ...halfWidthPos, x: halfWidthPos.x * 2 };
			const fullWidthIndex = coord2ToIndex(image.size, fullWidthPos);
			// TODO: Average.
			const leftPixel = image.pixels[fullWidthIndex]!;
			// const rightPixel = image.pixels[fullWidthIndex + 1]!;
			return leftPixel;
		}),
	};
}
