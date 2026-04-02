export type Coord2 = {
	readonly x: number;
	readonly y: number;
};

export const origo: Coord2 = { x: 0, y: 0 };

export function indexToCoord2(
	//
	size: Coord2,
	index: number,
): Coord2 {
	return {
		x: index % size.x,
		y: Math.floor(index / size.x),
	};
}
