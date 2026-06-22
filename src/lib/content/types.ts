export type LanguageCode = "de" | "en";

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

export type ImportedContentBlock = {
	header?: string | null;
	text?: string | null;
	date?: string | null;
	images?: ImportedImage[] | null;
	icons?: ImportedIcon[] | null;
};

export type ImportedFrontmatter = {
	locale?: LanguageCode | string | null;
	key?: string | null;
	type?: "page" | "location" | "job" | string | null;
	order?: number | null;
	menu?: string | null;
	seo?: ImportedSeo | null;
	blocks?: ImportedContentBlock[] | null;
	teaser?: {
		image?: string | null;
		title?: string | null;
	} | null;
	message?: string | null;
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
	key: string;
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
	title: string;
	slug: string;
	path: string;
	body?: string;
	frontmatter: ImportedFrontmatter;
};

export type SiteNavigationItem = {
	label: string;
	url: string;
	language: LanguageCode;
	order: number;
	menu?: string;
};
