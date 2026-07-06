export type LanguageCode = "de" | "en";

// Maps each language to the URL of the equivalent content in that language.
export type LanguageLinks = Partial<Record<LanguageCode, string>>;

export type ImportedSeo = {
	title?: string | null;
	description?: string | null;
	url?: string | null;
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
};

export type ImportedContentBlock = {
	layout?: string | null;
	header?: string | null;
	text?: string | null;
	date?: string | null;
	images?: ImportedImage[] | null;
	icons?: ImportedIcon[] | null;
	tiles?: ImportedContentTile[] | null;
};

export type ImportedFrontmatter = {
	locale?: LanguageCode | string | null;
	key?: string | null;
	template?: string | null;
	type?: "page" | "location" | "job" | string | null;
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
	slug: string;
	path: string;
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

export type SiteNavigationItem = {
	key: string;
	label: string;
	url: string;
	language: LanguageCode;
	order: number;
	menu?: string;
};
