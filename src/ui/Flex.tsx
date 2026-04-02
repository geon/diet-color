import type { JSX } from "react";
import cssModule from "./Flex.module.css";
import { stylize } from "./stylize.js";

const style = stylize(cssModule, "base");

type Direction = { readonly row: true } | { readonly col: true };
type Justify =
	| { readonly spaceBetween: true }
	| { readonly center: true }
	| { readonly fill: true }
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	| {};
type Gap = { readonly gap?: string };
type Props = Direction & Justify & Gap & React.ComponentProps<"div">;

export function Flex(props: Props): JSX.Element {
	const { row, col, spaceBetween, center, fill, gap, ...rest } =
		props as Props & Record<string, undefined>;

	return (
		<div
			{...rest}
			style={{ ...rest.style, gap }}
			className={style(
				row && "row",
				col && "col",
				spaceBetween && "spaceBetween",
				center && "center",
				fill && "fill",
			)}
		/>
	);
}
