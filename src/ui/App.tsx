import { useMemo, useState } from "react";
import { ImageDataCanvas } from "./ImageDataCanvas.js";
import { FileInput } from "./FileInput.js";
import {
	imageDataFromImage,
	imageDataFromImageElement,
	imageDataPixelFromRgb,
	imageDataPixelToRgb,
	imageDataToImage,
	imageElementFromFile,
} from "../image-data.js";
import { Flex } from "./Flex.jsx";
import { stylize } from "./stylize.js";
import {
	imageDoubleWidth,
	imageHalfWidth,
	imageMap,
	type Image,
} from "../image.js";
import cssModule from "./App.module.css";
import { c64RgbPalettes } from "../palette.js";
import { indexOfMinBy, objectEntries } from "../functions.js";
import { Select } from "./Select.js";
import { oklabFromRgb, oklabToRgb, type Oklab } from "../oklab.js";
import { dither } from "../palettize.js";
import { tileImageJoin, tileImageSplit } from "../tile-image.js";
import { type Coord2 } from "../coord2.js";
import { recordQuantizeToIndex } from "../record-math.js";

const style = stylize(cssModule, "base");

type PaletteId = keyof typeof c64RgbPalettes;

const paletteOptions = objectEntries({
	colodore: "Colodore",
	pepto: "Pepto",
	lospec: "lospec",
	wiki: "c64-wiki",
} satisfies Record<PaletteId, string>).map(([value, title]) => ({
	value,
	title,
}));

export function App() {
	const [imageData, setImageData] = useState<ImageData | undefined>(undefined);
	const [paletteId, setPaletteId] = useState<PaletteId>("colodore");

	return (
		<div className={style()}>
			<Flex col>
				<Flex row>
					<FileInput
						accept={["image/*"]}
						onChange={async (file) =>
							setImageData(
								imageDataFromImageElement(await imageElementFromFile(file)),
							)
						}
					>
						Open image...
					</FileInput>
					<Select
						value={paletteId}
						onChange={setPaletteId}
						options={paletteOptions}
					/>
				</Flex>
				{imageData && <Results imageData={imageData} paletteId={paletteId} />}
			</Flex>
		</div>
	);
}

// 4 double wide pixels
const tileSize: Coord2 = { x: 4, y: 8 };

function Results(props: {
	readonly imageData: ImageData;
	readonly paletteId: PaletteId;
}): React.ReactNode {
	const palette = useMemo(
		() => c64RgbPalettes[props.paletteId].map(oklabFromRgb),
		[props.paletteId],
	);

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

	return (
		<Flex col>
			<ImageDataCanvas imageData={imageData} />
			<Flex row fill>
				<ImageDataCanvas imageData={props.imageData} />
				<ImageDataCanvas
					imageData={oklabToImageData(
						imageDoubleWidth(getFullColorImage(idealPaletteImage)),
					)}
				/>
			</Flex>
		</Flex>
	);
}

function imageDataToOklab(imageData: ImageData): Image<Oklab> {
	return imageMap(imageDataToImage(imageData), (imageDataPixel) => {
		const rgb = imageDataPixelToRgb(imageDataPixel);
		const oklab = oklabFromRgb(rgb);
		return oklab;
	});
}

function oklabToImageData(quantized: Image<Oklab>): ImageData {
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
	oklabPalette: Oklab[],
): PaletteImage {
	return {
		palette: oklabPalette,
		...imageMap(oklabImage, (color) =>
			recordQuantizeToIndex(color, oklabPalette),
		),
	};
}

function getFullColorImage(paletteImage: PaletteImage): Image<Oklab> {
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
