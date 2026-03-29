import type { MutableTuple } from "./tuple.js";

export function chunk<T>(array: readonly T[], chunkLength: number): T[][] {
	const chunks: T[][] = [];
	let start = 0;
	do {
		chunks.push(array.slice(start, start + chunkLength));
		start += chunkLength;
	} while (start < array.length);
	return chunks;
}

export function strictChunk<T, TChunkLength extends number>(
	array: readonly T[],
	chunkLength: TChunkLength,
): MutableTuple<T, TChunkLength>[] {
	if (array.length % chunkLength !== 0) {
		throw new Error(
			"Strict chunked array.length must be a multiple of chunkLength." +
				" " +
				`array.length: ${array.length}, chunkLength: ${chunkLength}`,
		);
	}
	return chunk(array, chunkLength) as MutableTuple<T, TChunkLength>[];
}

export function mapRecord<TKey extends string, TIn, TOut>(
	record: Readonly<Record<TKey, TIn>>,
	transform: (value: TIn, key: TKey) => TOut,
): Record<TKey, TOut> {
	return Object.fromEntries(
		Object.entries(record).map(([key, value]) => [
			key,
			transform(value as TIn, key as TKey),
		]),
	) as Readonly<Record<TKey, TOut>>;
}

export function objectEntries<T extends Record<PropertyKey, unknown>>(
	obj: T,
): { [K in keyof T]: [K, T[K]] }[keyof T][] {
	return Object.entries(obj) as { [K in keyof T]: [K, T[K]] }[keyof T][];
}

export function sum(array: readonly number[]): number {
	return array.reduce((a, b) => a + b, 0);
}

export function indexOfMinBy<T>(
	array: readonly T[],
	accessor: (value: T) => number,
): number {
	if (!array.length) {
		throw new Error("indexOfMinBy must have an array length.");
	}

	let min = Number.POSITIVE_INFINITY;
	let minIndex = 0;

	for (const [index, value] of array.map(accessor).entries()) {
		if (value < min) {
			min = value;
			minIndex = index;
		}
	}

	return minIndex;
}

export function minBy<T>(
	array: readonly T[],
	accessor: (value: T) => number,
): T {
	return array[indexOfMinBy(array, accessor) ?? 0]!;
}
