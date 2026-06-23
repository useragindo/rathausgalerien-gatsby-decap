import type {
	ImportedFrontmatter,
	ImportedMdxNode,
	LanguageCode,
	NormalizedCategory,
	NormalizedJob,
	NormalizedLocation,
	NormalizedPage,
	SiteNavigationItem,
} from "./types";

const DEFAULT_LANGUAGE: LanguageCode = "de";

const PAGE_PATH_OVERRIDES: Record<string, string> = {
	brands: "shops",
	culinary: "gastronomie",
};

export const trim = (value?: string | null): string | undefined => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
};

export const isLanguageCode = (value?: string | null): value is LanguageCode =>
	value === "de" || value === "en";

export const getLanguage = (
	frontmatter?: ImportedFrontmatter | null,
): LanguageCode =>
	isLanguageCode(frontmatter?.locale) ? frontmatter.locale : DEFAULT_LANGUAGE;

export const slugify = (value: string): string =>
	value
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/&/g, "und")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

const withLanguagePrefix = (language: LanguageCode, slug?: string): string => {
	const cleanSlug = trim(slug)?.replace(/^\/+|\/+$/g, "");

	if (language === DEFAULT_LANGUAGE) {
		return cleanSlug ? `/${cleanSlug}/` : "/";
	}

	return cleanSlug ? `/${language}/${cleanSlug}/` : `/${language}/`;
};

const getFileSlug = (node: ImportedMdxNode): string | undefined => {
	const filePath = trim(node.internal?.contentFilePath);

	if (!filePath) {
		return undefined;
	}

	const match = filePath.match(/\/([^/]+)(?:\/index)?\.mdx?$/);
	return match?.[1] && match[1] !== "index" ? match[1] : undefined;
};

const getPageSlug = (node: ImportedMdxNode): string | undefined => {
	const frontmatter = node.frontmatter ?? {};
	const key = trim(frontmatter.key);
	const configuredSlug = trim(frontmatter.seo?.url);

	if (key === "index") {
		return undefined;
	}

	if (key && PAGE_PATH_OVERRIDES[key]) {
		return PAGE_PATH_OVERRIDES[key];
	}

	return configuredSlug ?? key ?? getFileSlug(node);
};

export const normalizePage = (node: ImportedMdxNode): NormalizedPage | null => {
	const frontmatter = node.frontmatter;

	if (!frontmatter || frontmatter.type !== "page") {
		return null;
	}

	const language = getLanguage(frontmatter);
	const key = trim(frontmatter.key) ?? getFileSlug(node) ?? node.id;
	const title = trim(frontmatter.seo?.title) ?? key;
	const slug = getPageSlug(node);

	return {
		id: node.id,
		language,
		key,
		title,
		description: trim(frontmatter.seo?.description),
		path: withLanguagePrefix(language, slug),
		body: trim(node.body),
		blocks: frontmatter.blocks ?? [],
		frontmatter,
	};
};

const getLocationBaseSlug = (group?: string | null): string =>
	group === "culinary" ? "gastronomie" : "shops";

export const normalizeLocation = (
	node: ImportedMdxNode,
): NormalizedLocation | null => {
	const frontmatter = node.frontmatter;

	if (!frontmatter || frontmatter.type !== "location") {
		return null;
	}

	const language = getLanguage(frontmatter);
	const title =
		trim(frontmatter.seo?.title) ?? trim(frontmatter.name) ?? node.id;
	const slug = trim(frontmatter.seo?.url) ?? slugify(title);
	const baseSlug = getLocationBaseSlug(frontmatter.group);

	return {
		id: node.id,
		language,
		title,
		description: trim(frontmatter.seo?.description),
		slug,
		path: withLanguagePrefix(language, `${baseSlug}/${slug}`),
		group: trim(frontmatter.group) ?? "brand",
		body: trim(node.body),
		frontmatter,
	};
};

export const normalizeJob = (node: ImportedMdxNode): NormalizedJob | null => {
	const frontmatter = node.frontmatter;

	if (!frontmatter || frontmatter.type !== "job") {
		return null;
	}

	const language = getLanguage(frontmatter);
	const titleParts = [
		trim(frontmatter.location),
		trim(frontmatter.position),
	].filter(Boolean);
	const title = titleParts.join(" – ") || trim(frontmatter.position) || "Job";
	const slug = getFileSlug(node) ?? slugify(title);

	return {
		id: node.id,
		language,
		title,
		slug,
		path: withLanguagePrefix(language, `jobs/${slug}`),
		body: trim(node.body),
		frontmatter,
	};
};

export const normalizeCategory = (
	node: ImportedMdxNode,
): NormalizedCategory | null => {
	const frontmatter = node.frontmatter;

	if (!frontmatter || frontmatter.type !== "category") {
		return null;
	}

	const language = getLanguage(frontmatter);
	const uuid = trim(frontmatter.uuid);
	const name = trim(frontmatter.name);

	if (!uuid || !name) {
		return null;
	}

	return {
		id: node.id,
		language,
		uuid,
		name,
		slug: getFileSlug(node) ?? slugify(name),
		frontmatter,
	};
};

export const createNavigationFromPages = (
	pages: NormalizedPage[],
): SiteNavigationItem[] =>
	pages
		.filter((page) => trim(page.frontmatter.menu))
		.map((page) => ({
			label: page.title,
			url: page.path,
			language: page.language,
			order: page.frontmatter.order ?? 999,
			menu: trim(page.frontmatter.menu),
		}))
		.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));

export const normalizeNodes = (nodes: ImportedMdxNode[]) => {
	const pages = nodes
		.map(normalizePage)
		.filter((page): page is NormalizedPage => Boolean(page));
	const locations = nodes
		.map(normalizeLocation)
		.filter((location): location is NormalizedLocation => Boolean(location));
	const jobs = nodes
		.map(normalizeJob)
		.filter((job): job is NormalizedJob => Boolean(job));
	const categories = nodes
		.map(normalizeCategory)
		.filter((category): category is NormalizedCategory => Boolean(category));

	return {
		pages,
		locations,
		jobs,
		categories,
		navigation: createNavigationFromPages(pages),
	};
};
