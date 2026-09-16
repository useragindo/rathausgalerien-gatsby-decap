import type { LanguageCode, NormalizedPage } from "./content/types";
import { trim } from "./content/normalize";
import type { NormalizedNavigationItem } from "./navigation";

// Default footer pages if none are configured in CMS.
const DEFAULT_FOOTER_PAGE_KEYS = ["locations", "jobs", "privacy", "imprint"] as const;

// Footer labels that intentionally differ from the page title.
const FOOTER_LABEL_OVERRIDES: Record<
	string,
	Partial<Record<LanguageCode, string>>
> = {
	locations: { de: "Lageplan", en: "Location Map" },
	jobs: { de: "Karriere", en: "Career" },
};

// Curated footer entries are resolved directly against every page (by `key`),
// not the `menu`-filtered navigation list: a page picked for the footer in
// Settings must show up whether or not it also carries a `menu` value (e.g.
// "imprint" has none). Pages tagged `menu: "misc"` are appended the same way
// the main navigation always has; a page named in both places is only ever
// linked once.
export const buildFooterNavigation = (
	pages: NormalizedPage[],
	language: LanguageCode,
	pageKeys?: string[] | null,
): NormalizedNavigationItem[] => {
	const pagesForLanguage = pages.filter((page) => page.language === language);
	const byKey = new Map(pagesForLanguage.map((page) => [page.key, page]));
	const usedKeys = new Set<string>();

	// Use CMS-configured page keys, or fall back to defaults if not configured.
	const footerPageKeys = pageKeys?.length ? pageKeys : DEFAULT_FOOTER_PAGE_KEYS;

	// Curated list: always present in the footer, in the configured order.
	const curated = footerPageKeys.flatMap((key) => {
		const page = byKey.get(key);
		if (!page) return [];

		usedKeys.add(key);
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

	// All pages flagged with menu: "misc" are appended to the footer navigation,
	// skipping any page already listed above via the curated selection.
	const miscItems = pagesForLanguage
		.filter((page) => trim(page.frontmatter.menu) === "misc" && !usedKeys.has(page.key))
		.sort((a, b) => (a.frontmatter.order ?? 999) - (b.frontmatter.order ?? 999))
		.map((page) => ({
			label: trim(page.frontmatter.menu_label) ?? page.title,
			url: page.path,
			language: page.language,
			openInNewTab: false,
		}));

	return [...curated, ...miscItems];
};
