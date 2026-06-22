import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { ContentBlockRenderer } from "../components/content-blocks";
import { Seo } from "../components/seo";
import { SiteLayout } from "../layouts";
import { MarkdownContent } from "../lib/content/markdown";
import type {
	NormalizedJob,
	NormalizedLocation,
	NormalizedPage,
	SiteNavigationItem,
} from "../lib/content/types";
import type { NormalizedNavigationItem } from "../lib/navigation";
import type { ResolvedSeo } from "../lib/seo";

type PageTemplateContext = {
	page: NormalizedPage;
	navigation: SiteNavigationItem[];
	locations: NormalizedLocation[];
	jobs: NormalizedJob[];
};

type PageTemplateProps = PageProps<Record<string, never>, PageTemplateContext>;

const toNavigationItems = (
	items: SiteNavigationItem[],
	language: string,
	menu?: string,
): NormalizedNavigationItem[] =>
	items
		.filter(
			(item) => item.language === language && (!menu || item.menu === menu),
		)
		.map((item) => ({
			label: item.label,
			url: item.url,
			language: item.language,
			openInNewTab: false,
		}));

const resolvePageSeo = (page: NormalizedPage): ResolvedSeo => ({
	title: page.title,
	description: page.description ?? "",
	canonicalUrl: page.path,
	openGraph: {
		title: page.title,
		description: page.description ?? "",
	},
});

const LocationList: React.FC<{
	locations: NormalizedLocation[];
	language: string;
	group: "brand" | "culinary";
}> = ({ locations, language, group }) => {
	const items = locations
		.filter(
			(location) => location.language === language && location.group === group,
		)
		.sort((a, b) => a.title.localeCompare(b.title));

	if (!items.length) {
		return null;
	}

	return (
		<section aria-labelledby={`${group}-list-title`}>
			<h2 id={`${group}-list-title`}>
				{group === "culinary" ? "Gastronomie" : "Shops"}
			</h2>
			<ul>
				{items.map((location) => (
					<li key={location.id}>
						<a href={location.path}>{location.title}</a>
						{location.description ? <p>{location.description}</p> : null}
					</li>
				))}
			</ul>
		</section>
	);
};

const JobList: React.FC<{ jobs: NormalizedJob[]; language: string }> = ({
	jobs,
	language,
}) => {
	const items = jobs.filter((job) => job.language === language);

	if (!items.length) {
		return null;
	}

	return (
		<section aria-labelledby="job-list-title">
			<h2 id="job-list-title">Offene Stellen</h2>
			<ul>
				{items.map((job) => (
					<li key={job.id}>
						<a href={job.path}>{job.title}</a>
					</li>
				))}
			</ul>
		</section>
	);
};

const PageTemplate: React.FC<PageTemplateProps> = ({ pageContext }) => {
	const { page, navigation, locations, jobs } = pageContext;
	const mainNavigation = toNavigationItems(navigation, page.language, "main");
	const footerNavigation = toNavigationItems(navigation, page.language, "misc");

	const pageClassName = `page page--${page.key}`;

	return (
		<SiteLayout
			mainNavigation={mainNavigation}
			footerNavigation={footerNavigation}
			siteTitle="RathausGalerien"
		>
			<article className={pageClassName}>
				<header className="page-hero">
					<h1 className="page-hero__title">{page.title}</h1>
					{page.description ? (
						<p className="page-hero__description">{page.description}</p>
					) : null}
				</header>
				<ContentBlockRenderer blocks={page.blocks} />
				<div className="page-body">
					<MarkdownContent content={page.body} />
				</div>
			</article>

			{page.key === "brands" ? (
				<LocationList
					locations={locations}
					language={page.language}
					group="brand"
				/>
			) : null}
			{page.key === "culinary" ? (
				<LocationList
					locations={locations}
					language={page.language}
					group="culinary"
				/>
			) : null}
			{page.key === "jobs" ? (
				<JobList jobs={jobs} language={page.language} />
			) : null}
		</SiteLayout>
	);
};

export default PageTemplate;

export const Head: HeadFC<Record<string, never>, PageTemplateContext> = ({
	pageContext,
}) => (
	<Seo
		seo={resolvePageSeo(pageContext.page)}
		language={pageContext.page.language}
	/>
);
