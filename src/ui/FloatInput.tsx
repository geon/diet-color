import { ParsedInput } from "./ParsedInput.js";
import type { Setter } from "./setter.js";

export function FloatInput(props: { value: number; onChange: Setter<number> }) {
	return (
		<ParsedInput
			value={props.value}
			onChange={props.onChange}
			parse={(text) => {
				let num: number | undefined;
				try {
					num = JSON.parse(text);
				} catch {
					// Ignore
				}
				return Number.isNaN(num) ? undefined : num;
			}}
			serialize={(value) => value.toString()}
		/>
	);
}
