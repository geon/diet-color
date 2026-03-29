import { mapRecord } from "./functions";
import type { Rgb } from "./rgb";

// https://bottosson.github.io/posts/oklab/

export type Oklab = {
	readonly L: number;
	readonly a: number;
	readonly b: number;
};

export function oklabFromRgb(c: Rgb): Oklab {
	const { r, g, b } = mapRecord(c, (x) => gammaToLinear(x / 255));

	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

	return {
		L: l * +0.2104542553 + m * +0.793617785 + s * -0.0040720468,
		a: l * +1.9779984951 + m * -2.428592205 + s * +0.4505937099,
		b: l * +0.0259040371 + m * +0.7827717662 + s * -0.808675766,
	};
}

export function oklabToRgb({ L, a, b }: Oklab): Rgb {
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

	return mapRecord(
		{
			r: +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
			g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
			b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
		},
		(x) => clamp(linearToGamma(x) * 255),
	);
}

function clamp(c: number): number {
	const cc = Math.round(c);
	return cc < 0 ? 0 : cc > 255 ? 255 : cc;
}

const gamma = 2.4;
function linearToGamma(x: number) {
	return Math.pow(x, 1 / gamma);
}
function gammaToLinear(x: number) {
	return Math.pow(x, gamma);
}
