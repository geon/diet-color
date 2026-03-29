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
import { imageMap } from "../image.js";
import cssModule from "./App.module.css";
import { c64RgbPalettes } from "../palette.js";
import { objectEntries } from "../functions.js";
import { Select } from "./Select.js";
import { recordQuantize } from "../record-math.js";
import { oklabFromRgb, oklabToRgb } from "../oklab.js";

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
		() =>
			imageMap(imageDataToImage(props.imageData), (imageDataPixel) => {
				const rgb = imageDataPixelToRgb(imageDataPixel);
				const oklab = oklabFromRgb(rgb);
				return oklab;
			}),
		[props.imageData],
	);

	const quantized = useMemo(
		() => imageMap(image, (rgb) => recordQuantize(rgb, palette)),
		[image, palette],
	);

	const imageData = useMemo(
		() =>
			imageDataFromImage(
				imageMap(quantized, (oklab) => {
					const rgb = oklabToRgb(oklab);
					const imageDataPixel = imageDataPixelFromRgb(rgb);
					return imageDataPixel;
				}),
			),
		[quantized],
	);

	return (
		<Flex row fill>
			<ImageDataCanvas imageData={props.imageData} />
			<ImageDataCanvas imageData={imageData} />
		</Flex>
	);
}
