import type { LanguageCode, SiteNavigationItem } from "./content/types";
import type { NormalizedNavigationItem } from "./navigation";

// The footer shows a curated list independent of each page's single `menu`
// field, so a page can appear both in the main menu and the footer.
const FOOTER_PAGE_KEYS = ["locations", "jobs", "privacy", "imprint"] as const;

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
): NormalizedNavigationItem[] => {
	const byKey = new Map(
		navigation
			.filter((item) => item.language === language)
			.map((item) => [item.key, item]),
	);

	// Curated list: always present in the footer.
	const curated = FOOTER_PAGE_KEYS.flatMap((key) => {
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
