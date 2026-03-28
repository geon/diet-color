import type { Coord2 } from "./coord2";
import { type Image, imageMap } from "./image";
import { type Oklab } from "./oklab";
import { recordQuantize } from "./record-math";
import { mapTuple } from "./tuple";

export function palettize(image: Image<Oklab>, palette: Oklab[]): Image<Oklab> {
	return imageMap(image, (oklab) => recordQuantize(oklab, palette));
}

export function dither(image: Image<Oklab>): Image<Oklab> {
	return imageMap(image, ditherPixel);
}

function ditherPixel(color: Oklab, pos: Coord2): Oklab {
	const bayerFactor = 0.1;
	const bayer = getBayer(pos);

	const scanLineFactor = 0;
	const scanLine = (pos.y % 2) - 0.5;

	const noiseFactor = 0;
	const noise = Math.random() - 0.5;

	return {
		...color,
		L:
			color.L + //
			bayer * bayerFactor +
			scanLine * scanLineFactor +
			noise * noiseFactor,
	};
}

//  https://matejlou.blog/2023/12/06/ordered-dithering-for-arbitrary-or-irregular-palettes/
const thresholds = [
	[0, 8, 2, 10],
	[12, 4, 14, 6],
	[3, 11, 1, 9],
	[15, 7, 13, 5],
] as const;
const thresholdsSize: Coord2 = {
	x: thresholds[0].length,
	y: thresholds.length,
};
const numThresholds = thresholdsSize.x * thresholdsSize.y;
const normalizedThresholds = mapTuple(thresholds, (x) =>
	mapTuple(x, (x) => (x / numThresholds) * 2 - 1),
);
function getBayer(pos: Coord2): number {
	return normalizedThresholds[pos.y % thresholdsSize.y]![
		pos.x % thresholdsSize.x
	]!;
}
