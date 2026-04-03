import { useMemo, useState } from "react";
import { ImageDataCanvas } from "./ImageDataCanvas.js";
import { FileInput } from "./FileInput.js";
import {
	imageDataFromImageElement,
	imageElementFromFile,
} from "../image-data.js";
import { Flex } from "./Flex.jsx";
import { stylize } from "./stylize.js";
import { imageDoubleWidth } from "../image.js";
import cssModule from "./App.module.css";
import { objectEntries } from "../functions.js";
import { Select } from "./Select.js";
import {
	getFullColorImage,
	oklabToImageData,
	usePalettization,
	type DitherOptions,
} from "../palettize.js";
import { c64RgbPalettes } from "../palette.js";
import { oklabFromRgb } from "../oklab.js";
import { FloatInput } from "./FloatInput.js";

const style = stylize(cssModule, "base");

export type PaletteId = keyof typeof c64RgbPalettes;

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

	const [bayerFactor, setBayerFactor] = useState<number>(0.01);
	const [scanLineFactor, setScanLineFactor] = useState<number>(0.05);
	const [noiseFactor, setNoiseFactor] = useState<number>(0);

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
					<FloatInput value={bayerFactor} onChange={setBayerFactor} />
					<FloatInput value={scanLineFactor} onChange={setScanLineFactor} />
					<FloatInput value={noiseFactor} onChange={setNoiseFactor} />
				</Flex>
				{imageData && (
					<Results
						imageData={imageData}
						paletteId={paletteId}
						ditherOptions={{
							bayerFactor,
							scanLineFactor,
							noiseFactor,
						}}
					/>
				)}
			</Flex>
		</div>
	);
}

function Results(props: {
	readonly imageData: ImageData;
	readonly paletteId: PaletteId;
	readonly ditherOptions: DitherOptions;
}): React.ReactNode {
	const palette = useMemo(
		() => c64RgbPalettes[props.paletteId].map(oklabFromRgb),
		[props.paletteId],
	);
	const { imageData, idealPaletteImage } = usePalettization(
		props.imageData,
		palette,
		props.ditherOptions,
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
