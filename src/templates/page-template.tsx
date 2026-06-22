import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { ContentBlockRenderer } from "../components/content-blocks";
import { Seo } from "../components/seo";
import { SiteLayout } from "../layouts";
import { MarkdownContent } from "../lib/content/markdown";
import type {
	NormalizedCategory,
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
	categories: NormalizedCategory[];
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

const getLocationImage = (location: NormalizedLocation): string | undefined =>
	location.frontmatter.images?.[0] ?? undefined;

const normalizeCategoryKey = (value: string): string =>
	value.trim().toLowerCase();

const stripMarkdown = (value: string): string =>
	value
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "")
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
		.replace(/^#{1,6}\s+/gm, "")
		.replace(/[>*_`~-]/g, "")
		.replace(/\s+/g, " ")
		.trim();

const truncateText = (value: string, maxLength = 135): string => {
	if (value.length <= maxLength) {
		return value;
	}

	const truncated = value
		.slice(0, maxLength)
		.replace(/\s+\S*$/, "")
		.trim();
	return `${truncated || value.slice(0, maxLength).trim()} …`;
};

const getFirstBodyParagraph = (body?: string): string | undefined => {
	if (!body) {
		return undefined;
	}

	return body
		.split(/\n{2,}/)
		.map(stripMarkdown)
		.find((paragraph) => paragraph.length > 0);
};

const getLocationCardText = (location: NormalizedLocation): string => {
	const bodyText = getFirstBodyParagraph(location.body);
	const description = location.description
		? stripMarkdown(location.description)
		: undefined;
	const cleanedDescription = description?.replace(
		/^Hier finden Sie Informationen zu .+? in den RathausGalerien\.?$/i,
		"",
	);
	const text =
		bodyText ||
		cleanedDescription ||
		`${location.title} in den RathausGalerien.`;

	return truncateText(text);
};

type LocationListingCard = {
	location: NormalizedLocation;
	categoryLabel: string;
	categoryKey: string;
};

const getLocationListingCards = (
	locations: NormalizedLocation[],
	categories: NormalizedCategory[],
	language: string,
	group: "brand" | "culinary",
): LocationListingCard[] => {
	const fallbackLabel = group === "culinary" ? "Genuss" : "Shop";
	const categoryByUuid = new Map(
		categories
			.filter((category) => category.language === language)
			.map((category) => [normalizeCategoryKey(category.uuid), category]),
	);

	return locations
		.filter(
			(location) => location.language === language && location.group === group,
		)
		.sort((a, b) => a.title.localeCompare(b.title))
		.flatMap((location) => {
			const labels = (location.frontmatter.categories ?? [])
				.map(
					(categoryUuid) =>
						categoryByUuid.get(normalizeCategoryKey(categoryUuid))?.name,
				)
				.filter((label): label is string => Boolean(label));
			const uniqueLabels = [...new Set(labels)];
			const cardLabels = uniqueLabels.length ? uniqueLabels : [fallbackLabel];

			return cardLabels.map((categoryLabel) => ({
				location,
				categoryLabel,
				categoryKey: normalizeCategoryKey(categoryLabel),
			}));
		});
};

const LocationList: React.FC<{
	locations: NormalizedLocation[];
	categories: NormalizedCategory[];
	language: string;
	group: "brand" | "culinary";
}> = ({ locations, categories, language, group }) => {
	const items = getLocationListingCards(locations, categories, language, group);
	const title = group === "culinary" ? "Gastronomie" : "Shops";
	const description =
		group === "culinary"
			? "Restaurants, Bars und Cafés mitten in den RathausGalerien."
			: "Marken, Services und Boutiquen im Zentrum von Innsbruck.";

	if (!items.length) {
		return null;
	}

	return (
		<section
			className={`listing-section listing-section--${group}`}
			aria-labelledby={`${group}-list-title`}
		>
			<header className="listing-section__header">
				<p className="listing-section__eyebrow">Alle {title}</p>
				<h2 id={`${group}-list-title`}>{title}</h2>
				<p>{description}</p>
			</header>
			<ul className="listing-grid">
				{items.map(({ location, categoryLabel, categoryKey }) => {
					const image = getLocationImage(location);
					const logo = location.frontmatter.logo;

					return (
						<li
							className={`listing-card${image ? " listing-card--has-media" : ""}`}
							key={`${location.id}-${categoryKey}`}
						>
							<a className="listing-card__link" href={location.path}>
								{image ? (
									<span className="listing-card__media">
										<img src={image} alt="" loading="lazy" />
									</span>
								) : null}
								<span className="listing-card__body">
									<span className="listing-card__meta">{categoryLabel}</span>
									{logo ? (
										<span className="listing-card__logo">
											<img
												src={logo}
												alt={`${location.title} Logo`}
												loading="lazy"
											/>
											<span className="visually-hidden">{location.title}</span>
										</span>
									) : (
										<span className="listing-card__title">
											{location.title}
										</span>
									)}
									<span className="listing-card__text">
										{getLocationCardText(location)}
									</span>
									<span className="listing-card__cta">Mehr erfahren</span>
								</span>
							</a>
						</li>
					);
				})}
			</ul>
		</section>
	);
};

const getHomepageIntroImage = (page: NormalizedPage): string | undefined => {
	const images = page.blocks.flatMap((block) => block.images ?? []);
	const entranceImage = images.find((image) =>
		image.image?.includes("eingang"),
	);

	return entranceImage?.image ?? images[0]?.image ?? undefined;
};

const ShoppingBagIcon: React.FC = () => (
	<svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
		<path d="M28 36h40l6 42H22l6-42Z" />
		<path d="M36 36v-8c0-8 5.5-14 12-14s12 6 12 14v8" />
		<circle cx="38" cy="50" r="2.5" />
		<circle cx="58" cy="50" r="2.5" />
	</svg>
);

const HomepageIntro: React.FC<{
	page: NormalizedPage;
	locations: NormalizedLocation[];
}> = ({ page, locations }) => {
	const image = getHomepageIntroImage(page);
	const shopCount = locations.filter(
		(location) =>
			location.language === page.language && location.group === "brand",
	).length;
	const countLabel = shopCount > 0 ? `${shopCount} Shops` : "Shops";

	return (
		<section className="home-intro" aria-labelledby="home-intro-title">
			{image ? (
				<div className="home-intro__media">
					<img src={image} alt="RathausGalerien Innsbruck" loading="eager" />
				</div>
			) : null}
			<div className="home-intro__card">
				<ShoppingBagIcon />
				<h1 id="home-intro-title">{page.title}</h1>
				<p>{countLabel}</p>
				<p>Mitten in Innsbruck</p>
			</div>
			{page.description ? (
				<p className="home-intro__description">{page.description}</p>
			) : null}
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
		<section
			className="listing-section listing-section--jobs"
			aria-labelledby="job-list-title"
		>
			<header className="listing-section__header">
				<p className="listing-section__eyebrow">Karriere</p>
				<h2 id="job-list-title">Offene Stellen</h2>
				<p>Aktuelle Jobs in den RathausGalerien und bei unseren Partnern.</p>
			</header>
			<ul className="listing-grid listing-grid--jobs">
				{items.map((job) => (
					<li
						className={`listing-card listing-card--job${job.frontmatter.images?.[0] ? " listing-card--has-media" : ""}`}
						key={job.id}
					>
						<a className="listing-card__link" href={job.path}>
							{job.frontmatter.images?.[0] ? (
								<span className="listing-card__media">
									<img src={job.frontmatter.images[0]} alt="" loading="lazy" />
								</span>
							) : null}
							<span className="listing-card__body">
								{job.frontmatter.location ? (
									<span className="listing-card__meta">
										{job.frontmatter.location}
									</span>
								) : null}
								<span className="listing-card__title">{job.title}</span>
								{job.frontmatter.specification ? (
									<span className="listing-card__text">
										{job.frontmatter.specification}
									</span>
								) : null}
								<span className="listing-card__cta">Job ansehen</span>
							</span>
						</a>
					</li>
				))}
			</ul>
		</section>
	);
};

const PageTemplate: React.FC<PageTemplateProps> = ({ pageContext }) => {
	const { page, navigation, locations, jobs, categories } = pageContext;
	const mainNavigation = toNavigationItems(navigation, page.language, "main");
	const footerNavigation = toNavigationItems(navigation, page.language, "misc");

	const pageClassName = `page page--${page.key}`;
	const isHomepage = page.key === "index";

	return (
		<SiteLayout
			mainNavigation={mainNavigation}
			footerNavigation={footerNavigation}
			siteTitle="RathausGalerien"
		>
			{isHomepage ? <HomepageIntro page={page} locations={locations} /> : null}
			<article className={pageClassName}>
				{!isHomepage ? (
					<header className="page-hero">
						<h1 className="page-hero__title">{page.title}</h1>
						{page.description ? (
							<p className="page-hero__description">{page.description}</p>
						) : null}
					</header>
				) : null}
				<ContentBlockRenderer blocks={page.blocks} />
				<div className="page-body">
					<MarkdownContent content={page.body} />
				</div>
			</article>

			{page.key === "brands" ? (
				<LocationList
					locations={locations}
					categories={categories}
					language={page.language}
					group="brand"
				/>
			) : null}
			{page.key === "culinary" ? (
				<LocationList
					locations={locations}
					categories={categories}
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
