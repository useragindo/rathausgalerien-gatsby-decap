import type {
	LanguageCode,
	NavigationItem,
	NavigationSettings,
	SocialLink,
} from "./cms/types";
import type {
	ImportedContentTile,
	MenuIconSymbol,
	SiteMenuSettings,
} from "./content/types";

export type NormalizedNavigationItem = {
	label: string;
	url: string;
	language?: LanguageCode;
	openInNewTab: boolean;
	ariaLabel?: string;
	icon?: string;
};

// A header icon with its link and its label already narrowed to the page's
// language.
export type MenuIcon = {
	symbol: MenuIconSymbol;
	image?: string;
	url: string;
	label: string;
	openInNewTab: boolean;
};

// The icons carry no text in the CMS — the editor picks a symbol, so the
// wording for screen readers and tooltips belongs here.
const MENU_ICON_LABELS: Record<MenuIconSymbol, Record<LanguageCode, string>> = {
	phone: { de: "Kontakt", en: "Contact" },
	location: { de: "Anfahrt", en: "Directions" },
	hours: { de: "Öffnungszeiten", en: "Opening hours" },
	custom: { de: "Mehr", en: "More" },
};

// Picks the language the page is rendered in out of the menu settings, which
// carry both languages side by side (see resolveMenuSettings).
export const getMenuIconsForLanguage = (
	menu: SiteMenuSettings | null | undefined,
	language: LanguageCode,
): MenuIcon[] =>
	(menu?.icons ?? []).map((icon) => ({
		symbol: icon.symbol,
		image: icon.image,
		url: icon.url[language],
		label: MENU_ICON_LABELS[icon.symbol][language],
		openInNewTab: icon.openInNewTab,
	}));

// The boxes are ordinary content tiles, so they are handed to the tile
// renderer unchanged. A box without a language is shown in both.
export const getMenuBoxesForLanguage = (
	menu: SiteMenuSettings | null | undefined,
	language: LanguageCode,
): ImportedContentTile[] =>
	(menu?.boxes ?? [])
		.filter((box) => !box.language || box.language === language)
		.map((box) => box.tile);

const trim = (value?: string | null): string | undefined => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
};

const isLanguage = (value?: string | null): value is LanguageCode =>
	value === "de" || value === "en";

export const normalizeNavigationItems = <
	T extends NavigationItem & { icon?: string | null },
>(
	items: T[] | null | undefined,
	language?: LanguageCode,
): NormalizedNavigationItem[] => {
	const normalizedItems: NormalizedNavigationItem[] = [];

	for (const item of items ?? []) {
		if (language && item.language && item.language !== language) {
			continue;
		}

		const label = trim(item.label);
		const url = trim(item.url);

		if (!label || !url) {
			continue;
		}

		normalizedItems.push({
			label,
			url,
			language: isLanguage(item.language) ? item.language : undefined,
			openInNewTab: Boolean(item.openInNewTab),
			ariaLabel: trim(item.ariaLabel),
			icon: trim(item.icon),
		});
	}

	return normalizedItems;
};

export const normalizeSocialLinks = (
	items: SocialLink[] | null | undefined,
): NormalizedNavigationItem[] => {
	const normalizedItems: NormalizedNavigationItem[] = [];

	for (const item of items ?? []) {
		const label = trim(item.label);
		const url = trim(item.url);

		if (!label || !url) {
			continue;
		}

		normalizedItems.push({
			label,
			url,
			openInNewTab: true,
			ariaLabel: trim(item.ariaLabel),
			icon: trim(item.icon),
		});
	}

	return normalizedItems;
};

export const getNavigationForLanguage = (
	navigation: NavigationSettings,
	language: LanguageCode,
) => ({
	mainNavigation: normalizeNavigationItems(navigation.mainNavigation, language),
	mobileNavigation: normalizeNavigationItems(
		navigation.mobileNavigation,
		language,
	),
	footerNavigation: normalizeNavigationItems(
		navigation.footerNavigation,
		language,
	),
	footerLegalNavigation: normalizeNavigationItems(
		navigation.footerLegalNavigation,
		language,
	),
	utilityNavigation: normalizeNavigationItems(
		navigation.utilityNavigation,
		language,
	),
	headerIconNavigation: normalizeNavigationItems(
		navigation.headerIconNavigation,
		language,
	),
	socialLinks: normalizeSocialLinks(navigation.socialLinks),
});
