export type LanguageCode = "de" | "en";

export type Maybe<T> = T | null | undefined;

export type ImageField = {
	image?: string | null;
	alt?: string | null;
};

export type LinkField = {
	label?: string | null;
	url?: string | null;
	openInNewTab?: boolean | null;
	ariaLabel?: string | null;
};

export type IconField = {
	name?: string | null;
	ariaLabel?: string | null;
};

export type SocialLink = {
	label?: string | null;
	url?: string | null;
	icon?: string | null;
	ariaLabel?: string | null;
};

export type OpenGraphFields = {
	title?: string | null;
	description?: string | null;
	image?: string | null;
	imageAlt?: string | null;
};

export type SeoFields = {
	seoTitle?: string | null;
	seoDescription?: string | null;
	canonicalUrl?: string | null;
	openGraph?: OpenGraphFields | null;
	structuredData?: string | null;
};

export type TranslationReference = {
	language?: LanguageCode | null;
	slug?: string | null;
};

export type OpeningHoursEntry = {
	day?: string | null;
	opens?: string | null;
	closes?: string | null;
	note?: string | null;
};

export type SiteSettings = {
	siteTitle?: string | null;
	siteDescription?: string | null;
	siteUrl?: string | null;
	defaultOgImage?: ImageField | null;
	defaultLanguage?: LanguageCode | null;
	availableLanguages?: Array<{
		code?: LanguageCode | null;
		label?: string | null;
	}> | null;
	contactEmail?: string | null;
	phone?: string | null;
	address?: {
		street?: string | null;
		postalCode?: string | null;
		city?: string | null;
		country?: string | null;
	} | null;
	centerStats?: {
		shopCount?: number | null;
		gastronomyCount?: number | null;
	} | null;
	openingHours?: OpeningHoursEntry[] | null;
	parking?: {
		spaces?: number | null;
		evChargingSpaces?: number | null;
		shortDescription?: string | null;
	} | null;
	location?: {
		mapImage?: ImageField | null;
		latitude?: number | null;
		longitude?: number | null;
	} | null;
	socialLinks?: SocialLink[] | null;
};

export type NavigationItem = LinkField & {
	language?: LanguageCode | null;
};

export type HeaderIconNavigationItem = NavigationItem & {
	icon?: string | null;
};

export type NavigationSettings = {
	mainNavigation?: NavigationItem[] | null;
	mobileNavigation?: NavigationItem[] | null;
	footerNavigation?: NavigationItem[] | null;
	footerLegalNavigation?: NavigationItem[] | null;
	utilityNavigation?: NavigationItem[] | null;
	headerIconNavigation?: HeaderIconNavigationItem[] | null;
	socialLinks?: SocialLink[] | null;
};

export type HeroFields = {
	heading?: string | null;
	text?: string | null;
	image?: string | null;
	imageAlt?: string | null;
	ariaLabel?: string | null;
};

export type PageFrontmatter = SeoFields & {
	title?: string | null;
	slug?: string | null;
	language?: LanguageCode | null;
	translations?: TranslationReference[] | null;
	hero?: HeroFields | null;
	contentBlocks?: PageContentBlock[] | null;
	published?: boolean | null;
};

export type BaseContentBlock = {
	blockTitle?: string | null;
};

export type HeroShoppingBlock = BaseContentBlock & {
	type: "heroShoppingBlock";
	eyebrow?: string | null;
	heading?: string | null;
	subheading?: string | null;
	primaryImage?: ImageField | null;
	icon?: IconField | null;
	stats?: Array<{
		value?: string | null;
		label?: string | null;
	}> | null;
	ariaLabel?: string | null;
};

export type SectionIntroBlock = BaseContentBlock & {
	type: "sectionIntroBlock";
	heading?: string | null;
	text?: string | null;
	anchorId?: string | null;
};

export type TeaserGridBlock = BaseContentBlock & {
	type: "teaserGridBlock";
	heading?: string | null;
	text?: string | null;
	teasers?: Array<{
		title?: string | null;
		text?: string | null;
		url?: string | null;
		variant?: string | null;
		image?: ImageField | null;
		icon?: IconField | null;
		ariaLabel?: string | null;
	}> | null;
};

export type GastronomyHighlightBlock = BaseContentBlock & {
	type: "gastronomyHighlightBlock";
	heading?: string | null;
	text?: string | null;
	highlightTile?: {
		title?: string | null;
		text?: string | null;
		icon?: string | null;
		url?: string | null;
		ariaLabel?: string | null;
	} | null;
	image?: ImageField | null;
};

export type NewsTeaserBlock = BaseContentBlock & {
	type: "newsTeaserBlock";
	heading?: string | null;
	teasers?: Array<{
		title?: string | null;
		text?: string | null;
		url?: string | null;
		image?: ImageField | null;
		ariaLabel?: string | null;
	}> | null;
};

export type ParkingBlock = BaseContentBlock & {
	type: "parkingBlock";
	heading?: string | null;
	text?: string | null;
	parkingTile?: {
		title?: string | null;
		spacesLabel?: string | null;
		evChargingLabel?: string | null;
		icon?: string | null;
		url?: string | null;
		ariaLabel?: string | null;
	} | null;
	image?: ImageField | null;
};

export type SocialTeaserBlock = BaseContentBlock & {
	type: "socialTeaserBlock";
	heading?: string | null;
	platform?: string | null;
	url?: string | null;
	image?: ImageField | null;
	ariaLabel?: string | null;
};

export type GiftIdeasSliderBlock = BaseContentBlock & {
	type: "giftIdeasSliderBlock";
	heading?: string | null;
	text?: string | null;
	introTile?: {
		title?: string | null;
		text?: string | null;
		icon?: string | null;
	} | null;
	slides?: Array<{
		title?: string | null;
		text?: string | null;
		url?: string | null;
		image?: ImageField | null;
		ariaLabel?: string | null;
	}> | null;
};

export type LinkListBlock = BaseContentBlock & {
	type: "linkListBlock";
	heading?: string | null;
	links?: LinkField[] | null;
};

export type PageContentBlock =
	| HeroShoppingBlock
	| SectionIntroBlock
	| TeaserGridBlock
	| GastronomyHighlightBlock
	| NewsTeaserBlock
	| ParkingBlock
	| SocialTeaserBlock
	| GiftIdeasSliderBlock
	| LinkListBlock;

export type ShopEntry = SeoFields & {
	title?: string | null;
	slug?: string | null;
	language?: LanguageCode | null;
	category?: string | null;
	shortDescription?: string | null;
	description?: string | null;
	heroImage?: ImageField | null;
	gallery?: ImageField[] | null;
	openingHours?: OpeningHoursEntry[] | null;
	contact?: {
		email?: string | null;
		phone?: string | null;
		website?: string | null;
	} | null;
	location?: {
		floor?: string | null;
		unit?: string | null;
		directionsText?: string | null;
	} | null;
	order?: number | null;
	featured?: boolean | null;
};

export type GastronomyEntry = Omit<ShopEntry, "location"> & {
	kitchenHours?: OpeningHoursEntry[] | null;
};

export type NewsEntry = SeoFields & {
	title?: string | null;
	slug?: string | null;
	language?: LanguageCode | null;
	publishDate?: string | null;
	category?: string | null;
	excerpt?: string | null;
	heroImage?: ImageField | null;
	gallery?: ImageField[] | null;
	author?: string | null;
	body?: string | null;
};

export type ServiceEntry = SeoFields & {
	title?: string | null;
	slug?: string | null;
	language?: LanguageCode | null;
	icon?: string | null;
	shortDescription?: string | null;
	body?: string | null;
	order?: number | null;
};

export type FaqEntry = SeoFields & {
	question?: string | null;
	answer?: string | null;
	language?: LanguageCode | null;
	category?: string | null;
	order?: number | null;
};
