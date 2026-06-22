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
		.filter(
			(item) => item.language === language && (!menu || item.menu === menu),
		)
		.map((item) => ({
			label: item.label,
			url: item.url,
			language: item.language,
			openInNewTab: false,
		}));

const trim = (value?: string | null): string | undefined => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
};

const stripMarkdownText = (value: string): string =>
	value
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "")
		.replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
		.replace(/^#{1,6}\s+/gm, "")
		.replace(/[>*_`~-]/g, "")
		.replace(/\\\n/g, " ")
		.replace(/\s+/g, " ")
		.trim();

const truncateText = (value: string, maxLength = 155): string => {
	if (value.length <= maxLength) {
		return value;
	}

	const truncated = value
		.slice(0, maxLength)
		.replace(/\s+\S*$/, "")
		.trim();
	return `${truncated || value.slice(0, maxLength).trim()} …`;
};

const getBodyExcerpt = (body?: string): string | undefined => {
	const paragraph = body
		?.split(/\n{2,}/)
		.map(stripMarkdownText)
		.find(Boolean);

	return paragraph ? truncateText(paragraph) : undefined;
};

const getJobSeoDescription = (job: NormalizedJob): string =>
	trim(job.frontmatter.seo?.description) ??
	trim(job.frontmatter.specification) ??
	getBodyExcerpt(job.body) ??
	"";

const resolveJobSeo = (job: NormalizedJob): ResolvedSeo => {
	const description = getJobSeoDescription(job);
	const title = trim(job.frontmatter.seo?.title) ?? job.title;

	return {
		title,
		description,
		canonicalUrl: job.path,
		openGraph: {
			title,
			description,
		},
	};
};

const getJobIndexPath = (job: NormalizedJob): string =>
	job.language === "de" ? "/jobs/" : `/${job.language}/jobs/`;

const getJobIndexLabel = (job: NormalizedJob): string =>
	job.language === "de" ? "Alle Jobs" : "All jobs";

const JobTemplate: React.FC<JobTemplateProps> = ({ pageContext }) => {
	const { job, navigation } = pageContext;
	const { frontmatter } = job;
	const images = frontmatter.images ?? [];
	const heroImage = images[0];
	const galleryImages = images.slice(1);
	const location = trim(frontmatter.location);
	const position = trim(frontmatter.position) ?? job.title;
	const specification = trim(frontmatter.specification);
	const hasProfile = Boolean(location || position || specification);

	return (
		<SiteLayout
			mainNavigation={toNavigationItems(navigation, job.language, "main")}
			footerNavigation={toNavigationItems(navigation, job.language, "misc")}
			siteTitle="RathausGalerien"
		>
			<article className="detail-page job-detail">
				<a className="detail-back-link" href={getJobIndexPath(job)}>
					← {getJobIndexLabel(job)}
				</a>

				<header className="job-detail__hero">
					{heroImage ? (
						<div className="job-detail__hero-media">
							<img src={heroImage} alt="" loading="eager" />
						</div>
					) : null}
					<div className="job-detail__intro">
						<ul className="job-detail__meta-list" aria-label="Jobdetails">
							<li>Karriere</li>
							{location ? <li>{location}</li> : null}
							{specification ? <li>{specification}</li> : null}
						</ul>
						<p className="job-detail__eyebrow">Offene Stelle</p>
						<h1>{position}</h1>
						{location ? (
							<p className="job-detail__location">{location}</p>
						) : null}
						{specification ? (
							<p className="job-detail__summary">{specification}</p>
						) : null}
					</div>
				</header>

				<div className="detail-layout job-detail__layout">
					{job.body ? (
						<section
							className="detail-panel detail-panel--main"
							aria-labelledby="job-description-title"
						>
							<p className="detail-panel__eyebrow">Bewerbung</p>
							<h2 id="job-description-title">Jobbeschreibung</h2>
							<div className="detail-rich-text">
								<MarkdownContent content={job.body} />
							</div>
						</section>
					) : null}

					{hasProfile ? (
						<aside className="detail-sidebar" aria-label="Job Informationen">
							<section
								className="detail-panel"
								aria-labelledby="job-profile-title"
							>
								<p className="detail-panel__eyebrow">Kurzinfo</p>
								<h2 id="job-profile-title">Jobprofil</h2>
								<dl className="detail-list">
									{location ? (
										<div className="detail-list__row">
											<dt>Unternehmen</dt>
											<dd>{location}</dd>
										</div>
									) : null}
									{position ? (
										<div className="detail-list__row">
											<dt>Position</dt>
											<dd>{position}</dd>
										</div>
									) : null}
									{specification ? (
										<div className="detail-list__row">
											<dt>Umfang</dt>
											<dd>{specification}</dd>
										</div>
									) : null}
								</dl>
							</section>
						</aside>
					) : null}
				</div>

				{galleryImages.length ? (
					<section
						className="detail-gallery"
						aria-labelledby="job-gallery-title"
					>
						<p className="detail-panel__eyebrow">Galerie</p>
						<h2 id="job-gallery-title">Eindrücke</h2>
						<ul className="detail-gallery__grid">
							{galleryImages.map((image) => (
								<li key={image}>
									<img src={image} alt="" loading="lazy" />
								</li>
							))}
						</ul>
					</section>
				) : null}
			</article>
		</SiteLayout>
	);
};

export default JobTemplate;

export const Head: HeadFC<Record<string, never>, JobTemplateContext> = ({
	pageContext,
}) => (
	<Seo
		seo={resolveJobSeo(pageContext.job)}
		language={pageContext.job.language}
	/>
);
