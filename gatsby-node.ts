import path from "path";
import type { GatsbyNode } from "gatsby";
import { normalizeNodes } from "./src/lib/content/normalize";
import type { ImportedMdxNode } from "./src/lib/content/types";

const pageTemplate = path.resolve("./src/templates/page-template.tsx");
const locationTemplate = path.resolve("./src/templates/location-template.tsx");
const jobTemplate = path.resolve("./src/templates/job-template.tsx");

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
	const { pages, locations, jobs, categories, navigation } =
		normalizeNodes(mdxNodes);
	const usedPaths = new Map<string, number>();

	for (const page of pages) {
		actions.createPage({
			path: makeUniquePath(page.path, usedPaths),
			component: pageTemplate,
			context: {
				page,
				navigation,
				locations,
				jobs,
				categories,
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
			},
		});
	}

	reporter.info(
		`Created ${pages.length} content pages, ${locations.length} location pages, ${jobs.length} job pages, and loaded ${categories.length} categories.`,
	);
};
