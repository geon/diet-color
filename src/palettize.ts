import { useMemo } from "react";
import type { Coord2 } from "./coord2";
import { indexOfMinBy } from "./functions";
import {
	type Image,
	imageDoubleWidth,
	imageHalfWidth,
	imageMap,
} from "./image";
import {
	imageDataToImage,
	imageDataPixelToRgb,
	imageDataFromImage,
	imageDataPixelFromRgb,
} from "./image-data";
import { oklabFromRgb, oklabToRgb, type Oklab } from "./oklab";
import { recordQuantize, recordQuantizeToIndex } from "./record-math";
import { tileImageSplit, tileImageJoin } from "./tile-image";
import { mapTuple } from "./tuple";

export function palettize(image: Image<Oklab>, palette: Oklab[]): Image<Oklab> {
	return imageMap(image, (oklab) => recordQuantize(oklab, palette));
}

export function dither(image: Image<Oklab>): Image<Oklab> {
	return imageMap(image, ditherPixel);
}

function ditherPixel(color: Oklab, pos: Coord2): Oklab {
	const bayerFactor = 0.06;
	const bayer = getBayer(pos);

	const scanLineFactor = 0.08;
	const scanLine = (pos.y % 2) - 0.5;

	const noiseFactor = 0.02;
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

// 4 double wide pixels
const tileSize: Coord2 = { x: 4, y: 8 };

export function usePalettization(
	props: {
		readonly imageData: ImageData;
	},
	palette: readonly Oklab[],
) {
	const image = useMemo(
		() => imageDataToOklab(props.imageData),
		[props.imageData],
	);

	const halfWidth = useMemo(() => imageHalfWidth(image), [image]);

	// eslint doesn't like functions as dependencies, but it is necessary for hot reloading.
	const _dither = dither;
	const ditheredImage = useMemo(() => _dither(halfWidth), [halfWidth, _dither]);

	const ditheredTiledImage = useMemo(
		() => tileImageSplit(ditheredImage, tileSize),
		[ditheredImage],
	);

	const idealPaletteImage = useMemo(
		() => getPaletteImage(ditheredImage, palette),
		[ditheredImage, palette],
	);

	const bgColorIndex = useMemo(() => {
		const histogram = paletteImageHistogram(idealPaletteImage);
		const bgColorIndex = indexOfMinBy(histogram, (x) => -x);
		return bgColorIndex;
	}, [idealPaletteImage]);

	const charsAndSubPalettes = useMemo(
		() =>
			imageMap(ditheredTiledImage, (ditheredTile) => {
				const idealPaletteTile = getPaletteImage(ditheredTile, palette);
				const histogram = paletteImageHistogram(idealPaletteTile);
				const topColorIndices = sortBy(
					histogram.map((count, index) => ({ count, index })),
					(x) => -x.count,
				).map((x) => x.index);

				const topColorRamIndex = topColorIndices.find((x) => x < 8);
				const charColorIndex = topColorRamIndex ?? 0;
				const top2OtherColorIndices = topColorIndices
					.filter((entry) => entry !== charColorIndex && entry !== bgColorIndex)
					.slice(0, 2);

				const subPalette = [
					bgColorIndex,
					...top2OtherColorIndices,
					charColorIndex,
				];

				const char = getPaletteImage(
					imageMap(idealPaletteTile, (paletteIndex) => palette[paletteIndex]!),
					subPalette.map((index) => palette[index]!),
				);

				return { subPalette, char };
			}),
		[bgColorIndex, palette, ditheredTiledImage],
	);

	const quantized = useMemo(
		() =>
			tileImageJoin(
				imageMap(charsAndSubPalettes, ({ subPalette, char }) =>
					imageMap(char, (paletteIndex) => palette[subPalette[paletteIndex]!]!),
				),
			),
		[charsAndSubPalettes, palette],
	);

	const imageData = useMemo(
		//
		() => oklabToImageData(imageDoubleWidth(quantized)),
		[quantized],
	);
	return { imageData, idealPaletteImage };
}

function imageDataToOklab(imageData: ImageData): Image<Oklab> {
	return imageMap(imageDataToImage(imageData), (imageDataPixel) => {
		const rgb = imageDataPixelToRgb(imageDataPixel);
		const oklab = oklabFromRgb(rgb);
		return oklab;
	});
}

export function oklabToImageData(quantized: Image<Oklab>): ImageData {
	return imageDataFromImage(
		imageMap(quantized, (oklab) => {
			const rgb = oklabToRgb(oklab);
			const imageDataPixel = imageDataPixelFromRgb(rgb);
			return imageDataPixel;
		}),
	);
}

function getPaletteImage(
	oklabImage: Image<Oklab>,
	oklabPalette: readonly Oklab[],
): PaletteImage {
	return {
		palette: oklabPalette,
		...imageMap(oklabImage, (color) =>
			recordQuantizeToIndex(color, oklabPalette),
		),
	};
}

export function getFullColorImage(paletteImage: PaletteImage): Image<Oklab> {
	return imageMap(
		paletteImage,
		(paletteIndex) => paletteImage.palette[paletteIndex]!,
	);
}
function sortBy<T>(array: readonly T[], select: (value: T) => number): T[] {
	return (
		array
			// `select` can be expensive, so do it only once and keep the original index.
			.map((x, index) => [index, select(x)] as const)
			// Sort by the selected value.
			.sort(([, a], [, b]) => a - b)
			// Map back to the value of the original array.
			.map(([index]) => array[index]!)
	);
}

type PaletteImage = Image<number> & {
	readonly palette: readonly Oklab[];
};

function paletteImageHistogram(image: PaletteImage): number[] {
	const histogram = image.palette.map((_) => 0);
	for (const pixel of image.pixels) {
		++histogram[pixel]!;
	}
	return histogram;
}
