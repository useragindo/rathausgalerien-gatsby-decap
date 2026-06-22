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
	const aboutImage = images[1] ?? images[0];
	const galleryImages = images.slice(2);
	const location = trim(frontmatter.location);
	const position = trim(frontmatter.position) ?? job.title;
	const specification = trim(frontmatter.specification);
	const excerpt = getBodyExcerpt(job.body);

	return (
		<SiteLayout
			mainNavigation={toNavigationItems(navigation, job.language, "main")}
			footerNavigation={toNavigationItems(navigation, job.language, "misc")}
			siteTitle="RathausGalerien"
		>
			<article className="job-detail">
				<a
					className="detail-back-link job-detail__back"
					href={getJobIndexPath(job)}
				>
					← {getJobIndexLabel(job)}
				</a>

				<header className="job-detail__hero">
					{heroImage ? (
						<img src={heroImage} alt="" loading="eager" />
					) : (
						<div className="job-detail__hero-placeholder" />
					)}
					<h1 className="visually-hidden">{position}</h1>
				</header>

				<section
					className="job-detail__info-grid"
					aria-label="Job Informationen"
				>
					<div className="job-detail__info-card job-detail__info-card--brand">
						<p className="job-detail__info-kicker">Karriere</p>
						<h2>{location ?? "RathausGalerien"}</h2>
						{excerpt ? <p>{excerpt}</p> : null}
					</div>

					<div className="job-detail__info-card job-detail__info-card--position">
						<span className="job-detail__info-icon" aria-hidden="true">
							◷
						</span>
						<h2>{position}</h2>
						{specification ? <p>{specification}</p> : null}
					</div>

					<div className="job-detail__info-card job-detail__info-card--application">
						<span className="job-detail__info-icon" aria-hidden="true">
							⌖
						</span>
						<h2>Bewerbung</h2>
						<p>Alle Details zur Bewerbung finden Sie in der Jobbeschreibung.</p>
						<a href="#job-description-title">Jetzt ansehen</a>
					</div>
				</section>

				{job.body ? (
					<section
						className="job-detail__about"
						aria-labelledby="job-description-title"
					>
						<div className="job-detail__about-copy">
							<p className="job-detail__about-kicker">Offene Stelle</p>
							<h2 id="job-description-title">{position}</h2>
							{location ? (
								<p className="job-detail__location">{location}</p>
							) : null}
							<div className="detail-rich-text">
								<MarkdownContent content={job.body} />
							</div>
						</div>
						{aboutImage ? (
							<div className="job-detail__about-media">
								<img src={aboutImage} alt="" loading="lazy" />
							</div>
						) : null}
					</section>
				) : null}

				{galleryImages.length ? (
					<section
						className="detail-gallery job-detail__gallery"
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
