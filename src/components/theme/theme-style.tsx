import * as React from "react";
import { buildThemeCssVariables } from "../../lib/content/theme";
import type { SiteTheme } from "../../lib/content/types";

// Writes the active CMS colour scheme into the document as CSS custom
// properties. Rendered server-side with the page, so the colours are in the
// delivered HTML and nothing flashes while hydrating.
export const ThemeStyle: React.FC<{ theme?: SiteTheme | null }> = ({
	theme,
}) => {
	const css = buildThemeCssVariables(theme);

	if (!css) {
		return null;
	}

	return (
		<style
			data-color-scheme={theme?.key}
			dangerouslySetInnerHTML={{ __html: css }}
		/>
	);
};
