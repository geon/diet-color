import { strictChunk } from "./functions.js";
import type { Image } from "./image.js";
import type { Rgb } from "./rgb.js";
import { assertTuple, type Tuple } from "./tuple.js";

export function imageDataToBlob(image: ImageData): Promise<Blob> {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("Missing canvas 2d context.");
	}
	canvas.width = image.width;
	canvas.height = image.height;
	ctx.putImageData(image, 0, 0);

	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => (blob ? resolve(blob) : reject()));
	});
}

export function imageDataFromImageElement(img: HTMLImageElement) {
	// Da'faque?
	// https://stackoverflow.com/a/79528941/446536
	const videoframe = new VideoFrame(img, {
		timestamp: 0,
	});
	const buffer = new ArrayBuffer(videoframe.allocationSize());
	videoframe.copyTo(buffer, { format: "RGBA" });
	videoframe.close();
	const imageData = new ImageData(
		new Uint8ClampedArray(buffer),
		img.width,
		img.height,
	);
	return imageData;
}

export async function imageElementFromFile(file: File | Blob | MediaSource) {
	return await new Promise<HTMLImageElement>((resolve) => {
		const img = new Image();
		img.onload = () => {
			URL.revokeObjectURL(img.src);
			resolve(img);
		};
		img.src = URL.createObjectURL(file);
	});
}

export type ImageDataPixel = Tuple<number, 4>;

export function imageDataToImage(imageData: ImageData): Image<ImageDataPixel> {
	const size = { x: imageData.width, y: imageData.height };
	return {
		size,
		pixels: assertTuple(strictChunk([...imageData.data], 4), size.x * size.y),
	};
}

export function imageDataFromImage(image: Image<ImageDataPixel>): ImageData {
	return new ImageData(
		new Uint8ClampedArray(image.pixels.flat()),
		image.size.x,
		image.size.y,
	);
}

export function imageDataPixelToRgb(pixel: ImageDataPixel): Rgb {
	const [r, g, b, _a] = pixel;
	return { r, g, b };
}
export function imageDataPixelFromRgb(pixel: Rgb): ImageDataPixel {
	const a = 255;
	const { r, g, b } = pixel;
	return [r, g, b, a];
}
