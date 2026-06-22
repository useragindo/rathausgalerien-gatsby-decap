import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { Seo } from "../components/seo";
import { SiteLayout } from "../layouts";
import { MarkdownContent } from "../lib/content/markdown";
import type { NormalizedJob, SiteNavigationItem } from "../lib/content/types";
import type { NormalizedNavigationItem } from "../lib/navigation";
import type { ResolvedSeo } from "../lib/seo";

type JobTemplateContext = {
	job: NormalizedJob;
	navigation: SiteNavigationItem[];
};

type JobTemplateProps = PageProps<Record<string, never>, JobTemplateContext>;

const toNavigationItems = (
	items: SiteNavigationItem[],
	language: string,
	menu?: string,
): NormalizedNavigationItem[] =>
	items
		.filter((item) => item.language === language && (!menu || item.menu === menu))
		.map((item) => ({
			label: item.label,
			url: item.url,
			language: item.language,
			openInNewTab: false,
		}));

const resolveJobSeo = (job: NormalizedJob): ResolvedSeo => ({
	title: job.title,
	description: job.frontmatter.specification ?? "",
	canonicalUrl: job.path,
	openGraph: {
		title: job.title,
		description: job.frontmatter.specification ?? "",
	},
});

const JobTemplate: React.FC<JobTemplateProps> = ({ pageContext }) => {
	const { job, navigation } = pageContext;
	const { frontmatter } = job;

	return (
		<SiteLayout
			mainNavigation={toNavigationItems(navigation, job.language, "main")}
			footerNavigation={toNavigationItems(navigation, job.language, "misc")}
			siteTitle="RathausGalerien"
		>
			<article>
				<header>
					<h1>{job.title}</h1>
					{frontmatter.specification ? <p>{frontmatter.specification}</p> : null}
				</header>
				{frontmatter.images?.length ? (
					<ul aria-label="Bilder">
						{frontmatter.images.map((image) => (
							<li key={image}>
								<img src={image} alt="" loading="lazy" />
							</li>
						))}
					</ul>
				) : null}
				<MarkdownContent content={job.body} />
			</article>
		</SiteLayout>
	);
};

export default JobTemplate;

export const Head: HeadFC<Record<string, never>, JobTemplateContext> = ({ pageContext }) => (
	<Seo seo={resolveJobSeo(pageContext.job)} language={pageContext.job.language} />
);
