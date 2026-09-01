import type {
	ImportedFrontmatter,
	ImportedMdxNode,
	LanguageCode,
	NormalizedCategory,
	NormalizedColorScheme,
	NormalizedJob,
	NormalizedLocation,
	NormalizedNews,
	NormalizedPage,
	SiteNavigationItem,
	SiteTheme,
} from "./types";

const DEFAULT_LANGUAGE: LanguageCode = "de";

const PAGE_PATH_OVERRIDES: Record<string, string> = {
	brands: "shops",
	culinary: "gastronomie",
};

// Maps legacy `key` values to the template that drives the page rendering.
// Used as a fallback when a page has no explicit `template` in its frontmatter.
const KEY_TEMPLATE_FALLBACK: Record<string, string> = {
	index: "home",
	brands: "shops",
	culinary: "gastronomie",
	locations: "lageplan",
	jobs: "jobs",
};

const getPageTemplate = (
	frontmatter: ImportedFrontmatter,
	key: string,
): string =>
	trim(frontmatter.template) ?? KEY_TEMPLATE_FALLBACK[key] ?? "standard";

// Frontmatter comes from YAML, so a field is only a string by convention, not
// by guarantee: an unquoted timestamp parses as a Date, `order: 300` as a
// number. Anything non-string is treated as absent instead of throwing, because
// a single CMS edit must not be able to abort the whole createPages run.
export const trim = (value?: unknown): string | undefined => {
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed ? trimmed : undefined;
};

// Dates are the one field the CMS writes unquoted, which YAML hands over as a
// Date. Normalized news dates stay ISO strings so downstream sorting and
// formatting keep working.
export const toDateString = (value?: unknown): string | undefined => {
	if (value instanceof Date)
		return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
	return trim(value);
};

// Resolves an explicit display value, falling back through later candidates
// until one is non-empty. Used to keep visible content (heading/intro)
// independent of SEO metadata (seo.title/seo.description) while preserving
// the previous behaviour when only SEO fields are set.
export const deriveDisplay = (
	explicit?: string | null,
	...fallbacks: Array<string | null | undefined>
): string =>
	trim(explicit) ??
	fallbacks.reduce<string | undefined>(
		(current, fallback) => current ?? trim(fallback),
		undefined,
	) ??
	"";

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
	const key = trim(frontmatter.key) ?? getFileSlug(node) ?? "";
	const template = getPageTemplate(frontmatter, key);
	const configuredSlug = trim(frontmatter.seo?.url);

	// The homepage lives at the language root ("/" or "/en/").
	if (template === "home" || key === "index") {
		return undefined;
	}

	// Funnel pages live at the language root (no path prefix).
	if (template === "funnel") {
		return configuredSlug ?? key ?? getFileSlug(node);
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
	const template = getPageTemplate(frontmatter, key);
	const seoTitle = trim(frontmatter.seo?.title);
	const seoDescription = trim(frontmatter.seo?.description);
	const title = seoTitle ?? key;
	const slug = getPageSlug(node);

	return {
		id: node.id,
		language,
		i18nKey: key,
		key,
		template,
		title,
		description: seoDescription,
		heading: deriveDisplay(frontmatter.heading, seoTitle, key),
		intro: deriveDisplay(frontmatter.intro, seoDescription) || undefined,
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
	const heading = deriveDisplay(
		frontmatter.heading,
		frontmatter.name,
		frontmatter.seo?.title,
		node.id,
	);
	const intro =
		deriveDisplay(frontmatter.intro, frontmatter.seo?.description) ||
		undefined;
	const seoTitle = deriveDisplay(frontmatter.seo?.title, heading);
	const slug = trim(frontmatter.seo?.url) ?? slugify(heading);
	const baseSlug = getLocationBaseSlug(frontmatter.group);

	return {
		id: node.id,
		language,
		i18nKey: getFileSlug(node) ?? slug,
		title: heading,
		heading,
		intro,
		seoTitle,
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
	const intro =
		deriveDisplay(
			frontmatter.intro,
			frontmatter.seo?.description,
			frontmatter.specification,
		) || undefined;

	return {
		id: node.id,
		language,
		i18nKey: getFileSlug(node) ?? slug,
		title,
		intro,
		slug,
		path: withLanguagePrefix(language, `jobs/${slug}`),
		body: trim(node.body),
		frontmatter,
	};
};

export const normalizeNews = (node: ImportedMdxNode): NormalizedNews | null => {
	const frontmatter = node.frontmatter;

	if (!frontmatter || frontmatter.type !== "news") {
		return null;
	}

	const language = getLanguage(frontmatter);
	const heading = deriveDisplay(
		frontmatter.heading,
		frontmatter.seo?.title,
		node.id,
	);
	const intro =
		deriveDisplay(frontmatter.intro, frontmatter.seo?.description) ||
		undefined;
	const slug =
		trim(frontmatter.seo?.url) ??
		trim(slugify(heading)) ??
		getFileSlug(node) ??
		node.id;

	return {
		id: node.id,
		language,
		i18nKey: getFileSlug(node) ?? slug,
		title: heading,
		heading,
		intro,
		slug,
		path: withLanguagePrefix(language, `news/${slug}`),
		date: toDateString(frontmatter.date) ?? null,
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

// Slot names become CSS custom properties, so only characters that are safe
// inside a custom property name are accepted. Which slots exist is the CMS's
// business, not this module's.
const COLOR_SLOT_PATTERN = /^[a-z][a-z0-9-]*$/;

export const normalizeColorScheme = (
	node: ImportedMdxNode,
): NormalizedColorScheme | null => {
	const frontmatter = node.frontmatter;

	if (!frontmatter || frontmatter.type !== "color_scheme") {
		return null;
	}

	const key = trim(frontmatter.key) ?? getFileSlug(node);

	if (!key) {
		return null;
	}

	const colors: Record<string, string> = {};

	for (const [slot, value] of Object.entries(frontmatter.colors ?? {})) {
		const color = trim(value);

		if (!color || !COLOR_SLOT_PATTERN.test(slot)) {
			continue;
		}

		colors[slot] = color;
	}

	if (!Object.keys(colors).length) {
		return null;
	}

	return {
		id: node.id,
		key,
		name: deriveDisplay(frontmatter.name, key),
		colors,
	};
};

// Reads the single settings entry that holds the active scheme. Returns the
// scheme key, not the scheme itself, so resolving stays in one place.
export const normalizeThemeSettings = (
	node: ImportedMdxNode,
): string | null => {
	const frontmatter = node.frontmatter;

	if (
		!frontmatter ||
		frontmatter.type !== "settings" ||
		trim(frontmatter.name) !== "theme"
	) {
		return null;
	}

	return trim(frontmatter.active_scheme) ?? null;
};

// Falls back to the first scheme when the setting is empty or points at a
// scheme that no longer exists, so a missing selection never leaves the site
// without colours.
export const resolveActiveTheme = (
	schemes: NormalizedColorScheme[],
	activeSchemeKey?: string | null,
): SiteTheme | undefined => {
	if (!schemes.length) {
		return undefined;
	}

	const requested = trim(activeSchemeKey);
	const scheme =
		schemes.find((candidate) => candidate.key === requested) ?? schemes[0];

	return {
		key: scheme.key,
		name: scheme.name,
		colors: scheme.colors,
	};
};

export const createNavigationFromPages = (
	pages: NormalizedPage[],
): SiteNavigationItem[] =>
	pages
		.filter((page) => trim(page.frontmatter.menu))
		.map((page) => ({
			key: page.key,
			label: page.title,
			url: page.path,
			language: page.language,
			order: page.frontmatter.order ?? 999,
			menu: trim(page.frontmatter.menu),
		}))
		.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));

export type FooterSocialLink = {
	label: string;
	url: string;
	icon?: string;
	openInNewTab: boolean;
};

const deriveSocialLabel = (url: string): string => {
	const value = url.toLowerCase();
	if (value.includes("instagram")) return "Instagram";
	if (value.includes("facebook") || value.includes("fb.")) return "Facebook";
	if (value.includes("youtube")) return "YouTube";
	if (value.includes("tiktok")) return "TikTok";
	if (value.includes("linkedin")) return "LinkedIn";
	return "Social Media";
};

// Reads the per-language social links from the "footer" block so the footer
// can render them (the block content is otherwise not consumed by the site).
export const buildFooterSocialLinks = (
	nodes: ImportedMdxNode[],
): Record<LanguageCode, FooterSocialLink[]> => {
	const byLanguage: Record<LanguageCode, FooterSocialLink[]> = {
		de: [],
		en: [],
	};

	for (const node of nodes) {
		const frontmatter = node.frontmatter;
		if (frontmatter?.type !== "block" || trim(frontmatter.name) !== "footer") {
			continue;
		}

		const language = getLanguage(frontmatter);
		byLanguage[language] = (frontmatter.social_media ?? [])
			.map((item): FooterSocialLink | null => {
				const url = trim(item?.link);
				if (!url) return null;
				return {
					label: deriveSocialLabel(url),
					url,
					icon: trim(item?.icon),
					openInNewTab: true,
				};
			})
			.filter((item): item is FooterSocialLink => item !== null);
	}

	return byLanguage;
};

type Translatable = { language: LanguageCode; i18nKey: string; path: string };

// Groups items by their language-independent identity so each item can resolve
// the URL of its counterpart in the other language.
export const buildLanguageLinks = <T extends Translatable>(
	items: T[],
): ((item: T) => Record<LanguageCode, string>) => {
	const byKey = new Map<string, Partial<Record<LanguageCode, string>>>();

	for (const item of items) {
		const entry = byKey.get(item.i18nKey) ?? {};
		entry[item.language] = item.path;
		byKey.set(item.i18nKey, entry);
	}

	return (item: T) => {
		const entry = byKey.get(item.i18nKey) ?? {};
		return {
			de: entry.de ?? "/",
			en: entry.en ?? "/en/",
		};
	};
};

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
	const news = nodes
		.map(normalizeNews)
		.filter((item): item is NormalizedNews => Boolean(item));
	const categories = nodes
		.map(normalizeCategory)
		.filter((category): category is NormalizedCategory => Boolean(category));
	const colorSchemes = nodes
		.map(normalizeColorScheme)
		.filter((scheme): scheme is NormalizedColorScheme => Boolean(scheme));
	const activeSchemeKey = nodes
		.map(normalizeThemeSettings)
		.find((key): key is string => Boolean(key));

	return {
		pages,
		locations,
		jobs,
		news,
		categories,
		navigation: createNavigationFromPages(pages),
		theme: resolveActiveTheme(colorSchemes, activeSchemeKey),
	};
};
