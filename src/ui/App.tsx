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
import { imageMap, type Image } from "../image.js";
import cssModule from "./App.module.css";
import { c64RgbPalettes } from "../palette.js";
import { objectEntries } from "../functions.js";
import { Select } from "./Select.js";
import { oklabFromRgb, oklabToRgb, type Oklab } from "../oklab.js";
import { palettize } from "../palettize.js";

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

	// eslint doesn't like functions as dependencies, but it is necessary for hot reloading.
	const _palettize = palettize;
	const quantized = useMemo(
		//
		() => _palettize(image, palette),
		[image, palette, _palettize],
	);

	const imageData = useMemo(
		//
		() => oklabToImageData(quantized),
		[quantized],
	);

	return (
		<Flex row fill>
			<ImageDataCanvas imageData={props.imageData} />
			<ImageDataCanvas imageData={imageData} />
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
