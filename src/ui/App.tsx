import { useMemo, useState } from "react";
import { ImageDataCanvas } from "./ImageDataCanvas.js";
import { FileInput } from "./FileInput.js";
import {
	imageDataFromImageElement,
	imageElementFromFile,
} from "../image-data.js";
import { Flex } from "./Flex.jsx";
import { stylize } from "./stylize.js";
import cssModule from "./App.module.css";
import { objectEntries } from "../functions.js";
import { Select } from "./Select.js";
import { usePalettization, type PalettizationResults } from "../palettize.js";
import { c64RgbPalettes } from "../palette.js";
import { oklabFromRgb } from "../oklab.js";
import { FloatInput } from "./FloatInput.js";
import type { Setter } from "./setter.js";
import { BlobDownloadButton } from "./BlobDownloadButton.js";
import { koalaSerialize } from "../c64/koala.js";

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

type Settings = {
	readonly paletteId: PaletteId;
	readonly bayerFactor: number;
	readonly scanLineFactor: number;
	readonly noiseFactor: number;
};
type Setters = {
	readonly setImageData: Setter<ImageData | undefined>;
	readonly setPaletteId: Setter<PaletteId>;
	readonly setBayerFactor: Setter<number>;
	readonly setScanLineFactor: Setter<number>;
	readonly setNoiseFactor: Setter<number>;
};

export function App() {
	const [imageData, setImageData] = useState<ImageData | undefined>(undefined);

	const [paletteId, setPaletteId] = useState<PaletteId>("colodore");

	const [bayerFactor, setBayerFactor] = useState<number>(0.01);
	const [scanLineFactor, setScanLineFactor] = useState<number>(0.05);
	const [noiseFactor, setNoiseFactor] = useState<number>(0);

	const settings = {
		paletteId,
		bayerFactor,
		scanLineFactor,
		noiseFactor,
	};
	const setters = {
		setImageData,
		setPaletteId,
		setBayerFactor,
		setScanLineFactor,
		setNoiseFactor,
	};

	return imageData ? (
		<ImageUi imageData={imageData} settings={settings} setters={setters} />
	) : (
		<NoImageUi settings={settings} setters={setters} />
	);
}

function NoImageUi(props: {
	readonly settings: Settings;
	readonly setters: Setters;
}) {
	return (
		<div className={style()}>
			<Flex col>
				<SettingsUi settings={props.settings} setters={props.setters} />
			</Flex>
		</div>
	);
}

function ImageUi(props: {
	readonly imageData: ImageData;
	readonly settings: Settings;
	readonly setters: Setters;
}) {
	// The palette must be memoized so it doesn't trigger a recalculation.
	const palette = useMemo(
		() => c64RgbPalettes[props.settings.paletteId].map(oklabFromRgb),
		[props.settings.paletteId],
	);

	const results = usePalettization(props.imageData, palette, {
		bayerFactor: props.settings.bayerFactor,
		scanLineFactor: props.settings.scanLineFactor,
		noiseFactor: props.settings.noiseFactor,
	});

	return (
		<div className={style()}>
			<Flex col>
				<SettingsUi
					settings={props.settings}
					setters={props.setters}
					results={results}
				/>
				<Flex col>
					<ImageDataCanvas imageData={results.imageData} />
					<Flex row fill>
						<ImageDataCanvas imageData={results.original} />
						<ImageDataCanvas imageData={results.ideal} />
					</Flex>
				</Flex>
			</Flex>
		</div>
	);
}

function SettingsUi(props: {
	readonly settings: Settings;
	readonly setters: Setters;
	readonly results?: PalettizationResults;
}) {
	return (
		<Flex row>
			<FileInput
				accept={["image/*"]}
				onChange={async (file) =>
					props.setters.setImageData(
						imageDataFromImageElement(await imageElementFromFile(file)),
					)
				}
			>
				Open image...
			</FileInput>
			<Select
				value={props.settings.paletteId}
				onChange={props.setters.setPaletteId}
				options={paletteOptions}
			/>
			<label>
				Ordered:{" "}
				<FloatInput
					value={props.settings.bayerFactor}
					onChange={props.setters.setBayerFactor}
				/>
			</label>
			<label>
				Lines:{" "}
				<FloatInput
					value={props.settings.scanLineFactor}
					onChange={props.setters.setScanLineFactor}
				/>
			</label>
			<label>
				White Noise:{" "}
				<FloatInput
					value={props.settings.noiseFactor}
					onChange={props.setters.setNoiseFactor}
				/>
			</label>

			{props.results?.getC64MulticolorBitmap && (
				<Flex row style={{ marginLeft: "auto" }}>
					<a
						href="https://tomseditor.com/gallery/online?f=kla2prg&lang=en"
						target="_blank"
					>
						Converter
					</a>
					<BlobDownloadButton
						getBlob={async () => {
							const multicolorBitmap = props.results!.getC64MulticolorBitmap!();
							const koala =
								multicolorBitmap && koalaSerialize(multicolorBitmap);
							return (
								koala && {
									blob: new Blob([koala.buffer as ArrayBuffer], {
										type: "application/octet-stream",
									}),
									fileName: "image.koa",
								}
							);
						}}
					>
						Export Koala
					</BlobDownloadButton>
				</Flex>
			)}
		</Flex>
	);
}
