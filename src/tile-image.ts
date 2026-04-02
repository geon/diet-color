import { type Coord2 } from "./coord2.js";
import { chunk, mapRecord, range, strictChunk } from "./functions.js";
import type { Image } from "./image.js";
import { recordDivide, recordMultiply } from "./record-math.js";

export type TileImage<T> = Image<Image<T>>;

export function tileImageSplit<T>(
	image: Image<T>,
	tileSize: Coord2,
): TileImage<T> {
	const tileImageSize = mapRecord(
		recordDivide(image.size, tileSize),
		Math.floor,
	);
	const tileLines = strictChunk(image.pixels, image.size.x).map((line) =>
		chunk(line, tileSize.x),
	);
	return {
		size: tileImageSize,
		pixels: range(tileImageSize.y).flatMap((tileY) =>
			range(tileImageSize.x).flatMap(
				(tileX): Image<T> => ({
					size: tileSize,
					pixels: range(tileSize.y).flatMap(
						(lineY) => tileLines[tileY * tileSize.y + lineY]![tileX]!,
					),
				}),
			),
		),
	};
}

export function tileImageJoin<T>(tileImage: TileImage<T>): Image<T> {
	const tileSize = tileImage.pixels[0]!.size;
	const imageSize = recordMultiply(tileImage.size, tileSize);
	return {
		size: imageSize,
		pixels: range(tileImage.size.y).flatMap((tileY) =>
			range(tileSize.y).flatMap((lineY) =>
				range(tileImage.size.x).flatMap((tileX) =>
					tileImage.pixels[tileY * tileImage.size.x + tileX]!.pixels.slice(
						lineY * tileSize.x,
						(lineY + 1) * tileSize.x,
					),
				),
			),
		),
	};
}
