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

const style = stylize(cssModule, "base");

export function App() {
	const [imageData, setImageData] = useState<ImageData | undefined>(undefined);

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
				</Flex>
				{imageData && <Results imageData={imageData} />}
			</Flex>
		</div>
	);
}

function Results(props: { imageData: ImageData }): React.ReactNode {
	const image = useMemo(
		() => imageMap(imageDataToImage(props.imageData), imageDataPixelToRgb),
		[props.imageData],
	);
	const imageData = useMemo(
		() => imageDataFromImage(imageMap(image, imageDataPixelFromRgb)),
		[image],
	);

	return (
		<Flex row fill>
			<ImageDataCanvas imageData={props.imageData} />
			<ImageDataCanvas imageData={imageData} />
		</Flex>
	);
}
