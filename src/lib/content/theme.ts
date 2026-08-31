import type { SiteTheme } from "./types";

// Turns the CMS colour scheme into CSS custom properties. The slot names are
// never enumerated here: whatever slots the scheme file carries end up in the
// document, so adding c5 in the CMS needs no code change.
//
// Every slot also gets a "-on" companion — the readable foreground for that
// surface, picked by contrast from the scheme's own text and background. That
// is why a scheme needs six colours instead of twelve pairs.

const FALLBACK_FOREGROUNDS = ["#ffffff", "#111111"];

const parseColor = (value: string): [number, number, number] | undefined => {
	const hex = value.trim().replace(/^#/, "");

	const expanded =
		hex.length === 3 || hex.length === 4
			? hex
					.slice(0, 3)
					.split("")
					.map((char) => char + char)
					.join("")
			: hex.slice(0, 6);

	if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
		return undefined;
	}

	return [
		Number.parseInt(expanded.slice(0, 2), 16),
		Number.parseInt(expanded.slice(2, 4), 16),
		Number.parseInt(expanded.slice(4, 6), 16),
	];
};

// WCAG 2.1 relative luminance.
const relativeLuminance = (color: [number, number, number]): number => {
	const [red, green, blue] = color.map((channel) => {
		const ratio = channel / 255;
		return ratio <= 0.03928
			? ratio / 12.92
			: ((ratio + 0.055) / 1.055) ** 2.4;
	});

	return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

export const getContrastRatio = (
	background: string,
	foreground: string,
): number => {
	const backgroundColor = parseColor(background);
	const foregroundColor = parseColor(foreground);

	if (!backgroundColor || !foregroundColor) {
		return 0;
	}

	const first = relativeLuminance(backgroundColor);
	const second = relativeLuminance(foregroundColor);
	const lighter = Math.max(first, second);
	const darker = Math.min(first, second);

	return (lighter + 0.05) / (darker + 0.05);
};

// The readable foreground for a surface: the candidate with the highest
// contrast against it. Candidates are the scheme's own text and background,
// so a light scheme writes dark text and a dark scheme writes light text
// without anyone maintaining a second value per slot.
export const resolveForeground = (
	background: string,
	candidates: string[],
): string | undefined => {
	let best: string | undefined;
	let bestRatio = 0;

	for (const candidate of candidates) {
		const ratio = getContrastRatio(background, candidate);

		if (ratio > bestRatio) {
			best = candidate;
			bestRatio = ratio;
		}
	}

	return best;
};

export const buildThemeCssVariables = (theme?: SiteTheme | null): string => {
	const slots = Object.entries(theme?.colors ?? {});

	if (!slots.length) {
		return "";
	}

	// The scheme's own text and background are the only candidates. The neutral
	// fallbacks step in only for a scheme that carries neither of them —
	// otherwise black would win on contrast against every light surface and the
	// scheme's text colour would never be used.
	const schemeCandidates = [theme?.colors.text, theme?.colors.bg].filter(
		(candidate): candidate is string => Boolean(candidate),
	);
	const foregroundCandidates = schemeCandidates.length
		? schemeCandidates
		: FALLBACK_FOREGROUNDS;

	const declarations: string[] = [];

	for (const [slot, color] of slots) {
		declarations.push(`--scheme-${slot}: ${color};`);

		const foreground = resolveForeground(
			color,
			foregroundCandidates.filter((candidate) => candidate !== color),
		);

		if (foreground) {
			declarations.push(`--scheme-${slot}-on: ${foreground};`);
		}
	}

	return `:root{${declarations.join("")}}`;
};
