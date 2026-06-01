import type {
	LanguageCode,
	NavigationItem,
	NavigationSettings,
	SocialLink,
} from "./cms/types";

export type NormalizedNavigationItem = {
	label: string;
	url: string;
	language?: LanguageCode;
	openInNewTab: boolean;
	ariaLabel?: string;
	icon?: string;
};

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
