import type { LanguageCode, SiteNavigationItem } from "./content/types";
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

export const buildFooterNavigation = (
	navigation: SiteNavigationItem[],
	language: LanguageCode,
	pageKeys?: string[] | null,
): NormalizedNavigationItem[] => {
	const byKey = new Map(
		navigation
			.filter((item) => item.language === language)
			.map((item) => [item.key, item]),
	);

	// Use CMS-configured page keys, or fall back to defaults if not configured.
	const footerPageKeys = pageKeys?.length ? pageKeys : DEFAULT_FOOTER_PAGE_KEYS;

	// Curated list: always present in the footer.
	const curated = footerPageKeys.flatMap((key) => {
		const item = byKey.get(key);
		if (!item) return [];

		const label =
			item.menuLabel ?? FOOTER_LABEL_OVERRIDES[key]?.[language] ?? item.label;
		return [
			{
				label,
				url: item.url,
				language: item.language,
				openInNewTab: false,
			},
		];
	});

	// All pages flagged with menu: "misc" are appended to the footer navigation.
	const miscItems = navigation
		.filter((item) => item.language === language && item.menu === "misc")
		.sort((a, b) => a.order - b.order)
		.map((item) => ({
			label: item.menuLabel ?? item.label,
			url: item.url,
			language: item.language,
			openInNewTab: false,
		}));

	return [...curated, ...miscItems];
};
