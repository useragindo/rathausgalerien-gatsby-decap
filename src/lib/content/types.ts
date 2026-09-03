export type LanguageCode = "de" | "en";

// Maps each language to the URL of the equivalent content in that language.
export type LanguageLinks = Partial<Record<LanguageCode, string>>;

export type ImportedSeo = {
	title?: string | null;
	description?: string | null;
	url?: string | null;
	image?: string | null;
	imageAlt?: string | null;
	ogType?: string | null;
	twitterCard?: string | null;
	noIndex?: boolean | null;
};

export type ImportedImage = {
	image?: string | null;
	alt?: string | null;
};

export type ImportedIcon = {
	icon?: string | null;
	link?: string | null;
	text?: string | null;
};

export type ImportedContentTile = {
	text?: string | null;
	// Legacy single-image field, kept for tiles created before the "images" list existed.
	image?: string | null;
	images?: ImportedImage[] | null;
	category?: string | null;
	link?: string | null;
	backgroundColor?: string | null;
	// Slot of the active colour scheme (bg, text, c1 … c4). Takes priority over
	// backgroundColor when set.
	color_token?: string | null;
	icons?: ImportedIcon[] | null;
};

export type ImportedContentBlock = {
	layout?: string | null;
	header?: string | null;
	teaserText?: string | null;
	text?: string | null;
	backgroundColor?: string | null;
	color_token?: string | null;
	reversed?: boolean | null;
	date?: string | null;
	images?: ImportedImage[] | null;
	icons?: ImportedIcon[] | null;
	tiles?: ImportedContentTile[] | null;
};

// A colour scheme is edited in the CMS, so the set of slots is content, not
// code: the record carries whatever slots the scheme file defines (today bg,
// text, c1 … c4).
export type ImportedColorSlots = Record<string, string | null | undefined>;

export type ImportedFrontmatter = {
	locale?: LanguageCode | string | null;
	key?: string | null;
	template?: string | null;
	type?:
		| "page"
		| "location"
		| "job"
		| "news"
		| "service"
		| "color_scheme"
		| "settings"
		| string
		| null;
	colors?: ImportedColorSlots | null;
	active_scheme?: string | null;
	heading?: string | null;
	intro?: string | null;
	// YAML parses an unquoted timestamp as a Date, so this is not always a
	// string. Read it through `toDateString`.
	date?: string | Date | null;
	funnel_url?: string | null;
	order?: number | null;
	menu?: string | null;
	seo?: ImportedSeo | null;
	blocks?: ImportedContentBlock[] | null;
	photos?: Array<{
		image?: string | null;
		label?: string | null;
		viewId?: string | null;
	}> | null;
	traffic_information?: string | null;
	teaser?: {
		image?: string | null;
		title?: string | null;
	} | null;
	message?: string | null;
	social_media?: Array<{
		icon?: string | null;
		link?: string | null;
	}> | null;
	copyright?: string | null;
	uuid?: string | null;
	name?: string | null;
	group?: "brand" | "culinary" | string | null;
	categories?: string[] | null;
	logo?: string | null;
	icon?: string | null;
	description?: string | null;
	tile?: boolean | null;
	tile_color?: string | null;
	images?: string[] | null;
	hours?: Array<{
		date?: string | null;
		time?: string | null;
	}> | null;
	address?: string | null;
	contact?: {
		email?: string | null;
		phone?: string | null;
		url?: string | null;
	} | null;
	viewId?: string | null;
	location?: string | null;
	position?: string | null;
	specification?: string | null;
};

export type ImportedMdxNode = {
	id: string;
	body?: string | null;
	frontmatter?: ImportedFrontmatter | null;
	internal?: {
		contentFilePath?: string | null;
	} | null;
};

export type NormalizedPage = {
	id: string;
	language: LanguageCode;
	// Language-independent identity used to link translations of the same page.
	i18nKey: string;
	key: string;
	template: string;
	title: string;
	description?: string;
	heading: string;
	intro?: string;
	path: string;
	body?: string;
	blocks: ImportedContentBlock[];
	frontmatter: ImportedFrontmatter;
};

export type NormalizedLocation = {
	id: string;
	language: LanguageCode;
	i18nKey: string;
	title: string;
	heading: string;
	intro?: string;
	seoTitle: string;
	description?: string;
	slug: string;
	path: string;
	group: string;
	body?: string;
	frontmatter: ImportedFrontmatter;
};

export type NormalizedJob = {
	id: string;
	language: LanguageCode;
	i18nKey: string;
	title: string;
	intro?: string;
	slug: string;
	path: string;
	body?: string;
	frontmatter: ImportedFrontmatter;
};

export type NormalizedNews = {
	id: string;
	language: LanguageCode;
	i18nKey: string;
	title: string;
	heading: string;
	intro?: string;
	slug: string;
	path: string;
	date: string | null;
	body?: string;
	frontmatter: ImportedFrontmatter;
};

export type NormalizedCategory = {
	id: string;
	language: LanguageCode;
	uuid: string;
	name: string;
	slug: string;
	frontmatter: ImportedFrontmatter;
};

export type ServiceTileColor = "bg" | "text" | "c1" | "c2" | "c3" | "c4";

export type NormalizedService = {
	id: string;
	language: LanguageCode;
	uuid: string;
	name: string;
	icon?: string;
	description?: string;
	tile: boolean;
	tileColor: ServiceTileColor;
	frontmatter: ImportedFrontmatter;
};

export type NormalizedColorScheme = {
	id: string;
	key: string;
	name: string;
	// Slot name (bg, text, c1 …) to colour value, exactly as the CMS holds it.
	colors: Record<string, string>;
};

// The colour scheme the CMS has activated for the whole site.
export type SiteTheme = {
	key: string;
	name: string;
	colors: Record<string, string>;
};

export type SiteNavigationItem = {
	key: string;
	label: string;
	url: string;
	language: LanguageCode;
	order: number;
	menu?: string;
};
