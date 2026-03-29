import type { JSX } from "react";

export function Select<T extends string>(props: {
	value: T;
	onChange: (value: T) => void;
	options: readonly {
		readonly title: string;
		readonly value: T;
	}[];
}): JSX.Element {
	return (
		<select
			value={props.value}
			onChange={(e) => props.onChange(e.currentTarget.value as T)}
		>
			{props.options.map((option, index) => (
				<option key={index} value={option.value}>
					{option.title}
				</option>
			))}
		</select>
	);
}
