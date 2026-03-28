import { type Image, imageMap } from "./image";
import { type Oklab } from "./oklab";
import { recordQuantize } from "./record-math";

export function palettize(image: Image<Oklab>, palette: Oklab[]): Image<Oklab> {
	return imageMap(image, (oklab) => recordQuantize(oklab, palette));
}
