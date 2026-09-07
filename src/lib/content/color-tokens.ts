import type { ColorToken, SiteTheme } from "./types";

export type { ColorToken };

type ColorTokenMeta = {
	value: ColorToken;
	label: string;
	// Swatch fallback for the CMS select before it can fetch the live scheme.
	defaultHex: string;
};

export const COLOR_TOKENS: ColorTokenMeta[] = [
	{ value: "bg", label: "Hintergrund (bg)", defaultHex: "#d1efff" },
	{ value: "text", label: "Text (text)", defaultHex: "#22254e" },
	{ value: "c1", label: "Farbe 1 (c1)", defaultHex: "#7bd0e5" },
	{ value: "c2", label: "Farbe 2 (c2)", defaultHex: "#ffa4cc" },
	{ value: "c3", label: "Farbe 3 (c3)", defaultHex: "#ffbb33" },
	{ value: "c4", label: "Farbe 4 (c4)", defaultHex: "#b58ec1" },
	{ value: "c5", label: "Farbe 5 (c5)", defaultHex: "#99cccd" },
	{ value: "c6", label: "Farbe 6 (c6)", defaultHex: "#8eb8c7" },
	{ value: "schwarz", label: "Schwarz", defaultHex: "#111111" },
	{ value: "weiss", label: "Weiß", defaultHex: "#ffffff" },
];

const SCHEME_SLOT_VALUES = new Set<string>([
	"bg",
	"text",
	"c1",
	"c2",
	"c3",
	"c4",
	"c5",
	"c6",
]);

const NEUTRAL_VAR_BY_TOKEN: Record<string, string> = {
	schwarz: "var(--color-black)",
	weiss: "var(--color-white)",
};

// Resolves a token to the CSS var it should render as. Scheme slots only
// resolve if the active theme actually carries that slot (an unknown or
// missing slot is ignored rather than emitting a var() that resolves to
// nothing); the two neutrals always resolve, since they are not theme-bound.
export const resolveColorTokenVar = (
	token: string | null | undefined,
	theme: SiteTheme | null | undefined,
): string | undefined => {
	const value = token?.trim();

	if (!value) {
		return undefined;
	}

	if (NEUTRAL_VAR_BY_TOKEN[value]) {
		return NEUTRAL_VAR_BY_TOKEN[value];
	}

	if (SCHEME_SLOT_VALUES.has(value) && theme?.colors[value]) {
		return `var(--scheme-${value})`;
	}

	return undefined;
};

// text_color/background_color are chosen independently (no automatic
// contrast pairing). Either can be set without the other; an unresolved
// token is ignored rather than emitting a variable that resolves to nothing.
export const resolveColorPairStyle = (
	textToken: string | null | undefined,
	backgroundToken: string | null | undefined,
	theme: SiteTheme | null | undefined,
): { color?: string; background?: string } | undefined => {
	const color = resolveColorTokenVar(textToken, theme);
	const background = resolveColorTokenVar(backgroundToken, theme);

	if (!color && !background) {
		return undefined;
	}

	return {
		...(background ? { background } : {}),
		...(color ? { color } : {}),
	};
};
