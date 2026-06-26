import type { LanguageLinks } from "./content/types";

export type LanguageOption = { code: string; label: string; url: string };

// Builds the language switcher options from the per-page translation links
// resolved at build time. Falls back to the language roots when a link is
// missing (e.g. content that only exists in one language).
export const buildLanguageOptions = (
	links?: LanguageLinks,
): LanguageOption[] => [
	{ code: "de", label: "DE", url: links?.de ?? "/" },
	{ code: "en", label: "EN", url: links?.en ?? "/en/" },
];
