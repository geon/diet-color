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
