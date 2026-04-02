import { useState } from "react";
import { ImageDataCanvas } from "./ImageDataCanvas.js";
import { FileInput } from "./FileInput.js";
import {
	imageDataFromImageElement,
	imageElementFromFile,
} from "../image-data.js";
import { Flex } from "./Flex.jsx";
import { stylize } from "./stylize.js";
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
	return (
		<Flex row fill>
			<ImageDataCanvas imageData={props.imageData} />
		</Flex>
	);
}
