import { type Image, imageMap } from "./image";
import { type Oklab } from "./oklab";
import { recordQuantize } from "./record-math";

export function palettize(image: Image<Oklab>, palette: Oklab[]): Image<Oklab> {
	return imageMap(image, (oklab) => recordQuantize(oklab, palette));
}

export function dither(image: Image<Oklab>): Image<Oklab> {
	return imageMap(image, ditherPixel);
}

function ditherPixel(color: Oklab): Oklab {
	const noiseFactor = 0.3;
	const noise = Math.random() - 0.5;

	return {
		...color,
		L:
			color.L + //
			noise * noiseFactor,
	};
}
