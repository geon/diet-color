/**
 * @param ...options Any class names from the CSS Module. `undefined` and `false` are ignored. Example: `buttonStyle("large", selected && "selected")`
 */
export type Style<TCssModule extends Record<string, string>> = (
	...options: ReadonlyArray<keyof TCssModule | undefined | false>
) => string;

/**
 * @param cssModule A CSS module. Make sure to use `vite-plugin-typed-css-modules` to get proper typing. Example: `import cssModule from "./my-style.module.css";`
 * @param baseStyleName Optional. Class name to allways include in the final list.
 * @returns Style
 */
export function stylize<
	TCssModule extends Record<string, string>,
	TBaseStyleName extends keyof TCssModule = never,
>(
	cssModule: TCssModule,
	baseStyleName?: TBaseStyleName,
): Style<Omit<TCssModule, TBaseStyleName>> {
	return (...options) => {
		const optionsSet = new Set<keyof TCssModule>(
			options.filter((option) => option !== undefined && option !== false),
		);

		if (baseStyleName) {
			optionsSet.add(baseStyleName);
		}

		return [...optionsSet].map((option) => cssModule[option]).join(" ");
	};
}
