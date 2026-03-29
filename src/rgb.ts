export interface Rgb {
	readonly r: number;
	readonly g: number;
	readonly b: number;
}

export const black = { r: 0, g: 0, b: 0 };

export function rgbFromHex(value: number): Rgb {
	return {
		r: (value & 0xff0000) >> 16,
		g: (value & 0xff00) >> 8,
		b: value & 0xff,
	};
}
