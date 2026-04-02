import type { Coord2 } from "./coord2";
import { type Image, imageMap } from "./image";
import { type Oklab } from "./oklab";
import { recordQuantize } from "./record-math";

export function palettize(image: Image<Oklab>, palette: Oklab[]): Image<Oklab> {
	return imageMap(image, (oklab) => recordQuantize(oklab, palette));
}

export function dither(image: Image<Oklab>): Image<Oklab> {
	return imageMap(image, ditherPixel);
}

function ditherPixel(color: Oklab, pos: Coord2): Oklab {
	const scanLineFactor = 0.15;
	const scanLine = (pos.y % 2) - 0.5;

	const noiseFactor = 0;
	const noise = Math.random() - 0.5;

	return {
		...color,
		L:
			color.L + //
			scanLine * scanLineFactor +
			noise * noiseFactor,
	};
}
