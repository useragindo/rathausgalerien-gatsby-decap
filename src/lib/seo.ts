import type { ImageField, OpenGraphFields, SeoFields, SiteSettings } from "./cms/types";

export type ResolvedSeo = {
	title: string;
	description: string;
	canonicalUrl?: string;
	openGraph: {
		title: string;
		description: string;
		image?: string;
		imageAlt?: string;
	};
	structuredData?: Record<string, unknown> | Record<string, unknown>[];
};

type ResolveSeoInput = SeoFields & {
	title?: string | null;
	description?: string | null;
	excerpt?: string | null;
	slug?: string | null;
};

const trim = (value?: string | null): string | undefined => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
};

const resolveImage = (
	entryOpenGraph?: OpenGraphFields | null,
	defaultOgImage?: ImageField | null,
): Pick<ResolvedSeo["openGraph"], "image" | "imageAlt"> => ({
	image: trim(entryOpenGraph?.image) ?? trim(defaultOgImage?.image),
	imageAlt: trim(entryOpenGraph?.imageAlt) ?? trim(defaultOgImage?.alt),
});

export const joinUrl = (baseUrl?: string | null, path?: string | null): string | undefined => {
	const base = trim(baseUrl)?.replace(/\/$/, "");
	const cleanPath = trim(path)?.replace(/^\//, "");

	if (!base) {
		return undefined;
	}

	if (!cleanPath) {
		return base;
	}

	return `${base}/${cleanPath}`;
};

export const parseStructuredData = (
	structuredData?: string | null,
): ResolvedSeo["structuredData"] | undefined => {
	const value = trim(structuredData);

	if (!value) {
		return undefined;
	}

	try {
		const parsed = JSON.parse(value) as unknown;
		if (Array.isArray(parsed) || (typeof parsed === "object" && parsed !== null)) {
			return parsed as ResolvedSeo["structuredData"];
		}
	} catch {
		return undefined;
	}

	return undefined;
};

export const resolveSeo = (
	entry: ResolveSeoInput,
	settings: SiteSettings = {},
): ResolvedSeo => {
	const title =
		trim(entry.seoTitle) ?? trim(entry.title) ?? trim(settings.siteTitle) ?? "";
	const description =
		trim(entry.seoDescription) ??
		trim(entry.description) ??
		trim(entry.excerpt) ??
		trim(settings.siteDescription) ??
		"";
	const canonicalUrl = trim(entry.canonicalUrl) ?? joinUrl(settings.siteUrl, entry.slug);
	const openGraphTitle = trim(entry.openGraph?.title) ?? title;
	const openGraphDescription = trim(entry.openGraph?.description) ?? description;
	const openGraphImage = resolveImage(entry.openGraph, settings.defaultOgImage);

	return {
		title,
		description,
		canonicalUrl,
		openGraph: {
			title: openGraphTitle,
			description: openGraphDescription,
			...openGraphImage,
		},
		structuredData: parseStructuredData(entry.structuredData),
	};
};
