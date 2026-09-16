import type { LanguageCode, NormalizedPage } from "./content/types";
import { trim } from "./content/normalize";
import type { NormalizedNavigationItem } from "./navigation";

// Default footer pages per language if none are configured in CMS — the
// German and English keys differ because the pages aren't guaranteed to
// share a key across translations (e.g. DE "karriere" vs EN "jobs").
const DEFAULT_FOOTER_PAGE_KEYS: Record<LanguageCode, string[]> = {
	de: ["locations", "karriere", "privacy", "imprint"],
	en: ["locations", "jobs", "privacy", "imprint"],
};

// Footer labels that intentionally differ from the page title.
const FOOTER_LABEL_OVERRIDES: Record<
	string,
	Partial<Record<LanguageCode, string>>
> = {
	locations: { de: "Lageplan", en: "Location Map" },
	jobs: { de: "Karriere", en: "Career" },
	karriere: { de: "Karriere", en: "Career" },
};

// Resolved directly against every page (by `key`), not the `menu`-filtered
// navigation list: a page picked for the footer in Settings must show up
// whether or not it also carries a `menu` value (e.g. "imprint" has none).
// The output is exactly the configured list, in the configured order —
// nothing is added automatically.
export const buildFooterNavigation = (
	pages: NormalizedPage[],
	language: LanguageCode,
	pageKeys?: string[] | null,
): NormalizedNavigationItem[] => {
	const pagesForLanguage = pages.filter((page) => page.language === language);
	const byKey = new Map(pagesForLanguage.map((page) => [page.key, page]));

	// Use CMS-configured page keys, or fall back to defaults if not configured.
	const footerPageKeys = pageKeys?.length ? pageKeys : DEFAULT_FOOTER_PAGE_KEYS[language];

	return footerPageKeys.flatMap((key) => {
		const page = byKey.get(key);
		if (!page) return [];

		const menuLabel = trim(page.frontmatter.menu_label);
		const label = menuLabel ?? FOOTER_LABEL_OVERRIDES[key]?.[language] ?? page.title;
		return [
			{
				label,
				url: page.path,
				language: page.language,
				openInNewTab: false,
			},
		];
	});
};
