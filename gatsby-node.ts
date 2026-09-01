import path from "path";
import type { GatsbyNode } from "gatsby";
import {
	buildFooterSocialLinks,
	buildLanguageLinks,
	normalizeNodes,
} from "./src/lib/content/normalize";
import type {
	ImportedMdxNode,
	LanguageCode,
	NormalizedCategory,
} from "./src/lib/content/types";

const pageTemplate = path.resolve("./src/templates/page-template.tsx");
const locationTemplate = path.resolve("./src/templates/location-template.tsx");
const jobTemplate = path.resolve("./src/templates/job-template.tsx");
const newsTemplate = path.resolve("./src/templates/news-template.tsx");
const categoryTemplate = path.resolve("./src/templates/category-template.tsx");

const makeUniquePath = (
	requestedPath: string,
	usedPaths: Map<string, number>,
): string => {
	const count = usedPaths.get(requestedPath) ?? 0;
	usedPaths.set(requestedPath, count + 1);

	if (count === 0) {
		return requestedPath;
	}

	return requestedPath.replace(/\/$/, `-${count + 1}/`);
};

export const createPages: GatsbyNode["createPages"] = async (args) => {
	const { actions, reporter } = args;
	const getNodesByType = (
		args as { getNodesByType?: (type: string) => unknown[] }
	).getNodesByType;

	if (!getNodesByType) {
		reporter.panicOnBuild(
			"Gatsby getNodesByType API is unavailable; cannot create content pages.",
		);
		return;
	}

	const mdxNodes = getNodesByType("Mdx") as ImportedMdxNode[];
	const { pages, locations, jobs, news, categories, navigation, theme } =
		normalizeNodes(mdxNodes);
	const usedPaths = new Map<string, number>();

	const pageLanguageLinks = buildLanguageLinks(pages);
	const locationLanguageLinks = buildLanguageLinks(locations);
	const jobLanguageLinks = buildLanguageLinks(jobs);
	const newsLanguageLinks = buildLanguageLinks(news);
	const socialLinksByLanguage = buildFooterSocialLinks(mdxNodes);

	for (const page of pages) {
		actions.createPage({
			path: makeUniquePath(page.path, usedPaths),
			component: pageTemplate,
			context: {
				page,
				navigation,
				locations,
				jobs,
				news,
				categories,
				theme,
				languageLinks: pageLanguageLinks(page),
				socialLinks: socialLinksByLanguage[page.language],
			},
		});
	}

	for (const location of locations) {
		actions.createPage({
			path: makeUniquePath(location.path, usedPaths),
			component: locationTemplate,
			context: {
				location,
				navigation,
				categories,
				news,
				theme,
				languageLinks: locationLanguageLinks(location),
				socialLinks: socialLinksByLanguage[location.language],
			},
		});
	}

	for (const job of jobs) {
		actions.createPage({
			path: makeUniquePath(job.path, usedPaths),
			component: jobTemplate,
			context: {
				job,
				navigation,
				news,
				theme,
				languageLinks: jobLanguageLinks(job),
				socialLinks: socialLinksByLanguage[job.language],
			},
		});
	}

	for (const item of news) {
		actions.createPage({
			path: makeUniquePath(item.path, usedPaths),
			component: newsTemplate,
			context: {
				news: item,
				navigation,
				theme,
				languageLinks: newsLanguageLinks(item),
				socialLinks: socialLinksByLanguage[item.language],
			},
		});
	}

	const categoriesBySlug = new Map<string, NormalizedCategory[]>();
	for (const category of categories) {
		const list = categoriesBySlug.get(category.slug) ?? [];
		list.push(category);
		categoriesBySlug.set(category.slug, list);
	}

	for (const category of categories) {
		const languagePrefix = category.language === "de" ? "" : `${category.language}/`;
		const categoryPath = `/${languagePrefix}category/${category.slug}/`;
		const relatedCategories = categoriesBySlug.get(category.slug) ?? [];
		const languageLinks: Record<LanguageCode, string> = {
			de: "/",
			en: "/en/",
		};

		for (const related of relatedCategories) {
			const prefix = related.language === "de" ? "" : `${related.language}/`;
			languageLinks[related.language] = `/${prefix}category/${related.slug}/`;
		}

		actions.createPage({
			path: makeUniquePath(categoryPath, usedPaths),
			component: categoryTemplate,
			context: {
				category,
				navigation,
				locations,
				categories,
				news,
				theme,
				languageLinks,
				socialLinks: socialLinksByLanguage[category.language],
			},
		});
	}

	reporter.info(
		`Created ${pages.length} content pages, ${locations.length} location pages, ${jobs.length} job pages, ${news.length} news pages, ${categories.length} category pages.`,
	);
};
