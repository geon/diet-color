import { indexOfMinBy, mapRecord, sum } from "./functions.js";

export type NumberRecord<Key extends string> = Readonly<Record<Key, number>>;

export function recordAdd<Key extends string>(
	a: NumberRecord<Key>,
	b: NumberRecord<Key>,
): NumberRecord<Key> {
	return mapRecord(a, (a, key) => a + b[key]);
}

export function recordSubtract<Key extends string>(
	a: NumberRecord<Key>,
	b: NumberRecord<Key>,
): NumberRecord<Key> {
	return mapRecord(a, (a, key) => a - b[key]);
}

export function recordMultiply<Key extends string>(
	a: NumberRecord<Key>,
	b: NumberRecord<Key>,
): NumberRecord<Key> {
	return mapRecord(a, (a, key) => a * b[key]);
}

export function recordDivide<Key extends string>(
	a: NumberRecord<Key>,
	b: NumberRecord<Key>,
): NumberRecord<Key> {
	return mapRecord(a, (a, key) => a / b[key]);
}

export function recordScale<Key extends string>(
	a: NumberRecord<Key>,
	factor: number,
): NumberRecord<Key> {
	return mapRecord(a, (a) => a * factor);
}

export function recordDistanceSquared<Key extends string>(
	a: NumberRecord<Key>,
	b: NumberRecord<Key>,
): number {
	return sum(
		(Object.values(recordSubtract(a, b)) as readonly number[]).map(
			(x) => x ** 2,
		),
	);
}

export function recordQuantizeToIndex<T extends string>(
	color: NumberRecord<T>,
	palette: readonly NumberRecord<T>[],
): number {
	return indexOfMinBy(palette, (entry) => recordDistanceSquared(color, entry));
}

export function recordQuantize<T extends string>(
	color: NumberRecord<T>,
	palette: readonly NumberRecord<T>[],
): NumberRecord<T> {
	return palette[recordQuantizeToIndex(color, palette)]!;
}
