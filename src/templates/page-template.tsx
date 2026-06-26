import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { ContentBlockRenderer } from "../components/content-blocks";
import { LocationPlan } from "../components/location-plan";
import { Seo } from "../components/seo";
import { SiteLayout } from "../layouts";
import {
	normalizeCategoryKey,
	resolveCategoryLabels,
} from "../lib/content/categories";
import { MarkdownContent } from "../lib/content/markdown";
import type {
	LanguageLinks,
	NormalizedCategory,
	NormalizedJob,
	NormalizedLocation,
	NormalizedPage,
	SiteNavigationItem,
} from "../lib/content/types";
import { buildFooterNavigation } from "../lib/footer";
import { buildLanguageOptions } from "../lib/language";
import type { NormalizedNavigationItem } from "../lib/navigation";
import type { ResolvedSeo } from "../lib/seo";

type PageTemplateContext = {
	page: NormalizedPage;
	navigation: SiteNavigationItem[];
	locations: NormalizedLocation[];
	jobs: NormalizedJob[];
	categories: NormalizedCategory[];
	languageLinks?: LanguageLinks;
	socialLinks?: NormalizedNavigationItem[];
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

type ListingFilterOption = {
	key: string;
	label: string;
};

const getLocationListingCards = (
	locations: NormalizedLocation[],
	categories: NormalizedCategory[],
	language: string,
	group: "brand" | "culinary",
): LocationListingCard[] => {
	const fallbackLabel = group === "culinary" ? "Genuss" : "Shop";
	return locations
		.filter(
			(location) => location.language === language && location.group === group,
		)
		.sort((a, b) => a.title.localeCompare(b.title))
		.flatMap((location) => {
			const cardLabels = resolveCategoryLabels(
				location.frontmatter.categories,
				categories,
				language,
				fallbackLabel,
			);

			return cardLabels.map((categoryLabel) => ({
				location,
				categoryLabel,
				categoryKey: normalizeCategoryKey(categoryLabel),
			}));
		});
};

type LocationListProps = {
	locations: NormalizedLocation[];
	categories: NormalizedCategory[];
	language: string;
	group: "brand" | "culinary";
	showHeader?: boolean;
};

const LocationList: React.FC<LocationListProps> = ({
	locations,
	categories,
	language,
	group,
	showHeader = true,
}) => {
	const items = React.useMemo(
		() => getLocationListingCards(locations, categories, language, group),
		[locations, categories, language, group],
	);
	const title = group === "culinary" ? "Gastronomie" : "Shops";
	const description =
		group === "culinary"
			? "Restaurants, Bars und Cafés mitten in den RathausGalerien."
			: "Marken, Services und Boutiquen im Zentrum von Innsbruck.";
	const hasCategoryFilter = group === "brand";
	const filterOptions = React.useMemo<ListingFilterOption[]>(() => {
		if (!hasCategoryFilter) {
			return [];
		}

		const optionsByKey = new Map<string, ListingFilterOption>();

		for (const item of items) {
			if (!optionsByKey.has(item.categoryKey)) {
				optionsByKey.set(item.categoryKey, {
					key: item.categoryKey,
					label: item.categoryLabel,
				});
			}
		}

		return Array.from(optionsByKey.values()).sort((a, b) =>
			a.label.localeCompare(b.label, language),
		);
	}, [hasCategoryFilter, items, language]);
	const [activeCategoryKey, setActiveCategoryKey] =
		React.useState<string>("all");

	React.useEffect(() => {
		setActiveCategoryKey("all");
	}, [language, group]);

	const visibleItems = React.useMemo(
		() =>
			activeCategoryKey === "all"
				? items
				: items.filter((item) => item.categoryKey === activeCategoryKey),
		[activeCategoryKey, items],
	);

	if (!items.length) {
		return null;
	}

	return (
		<section
			className={`listing-section listing-section--${group}`}
			aria-labelledby={showHeader ? `${group}-list-title` : undefined}
		>
			{showHeader ? (
				<header className="listing-section__header">
					<p className="listing-section__eyebrow">Alle {title}</p>
					<h2 id={`${group}-list-title`}>{title}</h2>
					<p>{description}</p>
				</header>
			) : null}
			{hasCategoryFilter && filterOptions.length > 0 ? (
				<div
					className="listing-filters"
					role="toolbar"
					aria-label="Shop-Kategorien filtern"
				>
					<button
						type="button"
						className={`listing-filters__pill${
							activeCategoryKey === "all"
								? " listing-filters__pill--active"
								: ""
						}`}
						onClick={() => setActiveCategoryKey("all")}
						aria-pressed={activeCategoryKey === "all"}
					>
						Alle
					</button>
					{filterOptions.map((option) => (
						<button
							key={option.key}
							type="button"
							className={`listing-filters__pill${
								activeCategoryKey === option.key
									? " listing-filters__pill--active"
									: ""
							}`}
							onClick={() => setActiveCategoryKey(option.key)}
							aria-pressed={activeCategoryKey === option.key}
						>
							{option.label}
						</button>
					))}
				</div>
			) : null}
			<ul className="listing-grid">
				{visibleItems.map(({ location, categoryLabel, categoryKey }) => {
					const image = getLocationImage(location);
					const logo = location.frontmatter.logo;

					return (
						<li
							className="listing-card listing-card--has-media"
							key={`${location.id}-${categoryKey}`}
						>
							<a className="listing-card__link" href={location.path}>
								<span
									className={`listing-card__media${
										image ? "" : " listing-card__media--placeholder"
									}`}
								>
									{image ? (
										<img src={image} alt="" loading="lazy" />
									) : (
										<span>{categoryLabel}</span>
									)}
								</span>
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
								</span>
							</a>
						</li>
					);
				})}
			</ul>
		</section>
	);
};

const getMarkdownImage = (content?: string): string | undefined => {
	if (!content) {
		return undefined;
	}

	const match = content.match(/!\[[^\]]*\]\(([^)]+)\)/);
	const imagePath = match?.[1]?.trim();

	if (!imagePath) {
		return undefined;
	}

	return imagePath.split(/\s+/)[0];
};

const getHomepageIntroImage = (page: NormalizedPage): string | undefined => {
	const bodyImage = getMarkdownImage(page.body);

	if (bodyImage) {
		return bodyImage;
	}

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
				{items.map((job) => {
					const image = job.frontmatter.images?.[0];

					return (
						<li
							className="listing-card listing-card--job listing-card--has-media"
							key={job.id}
						>
							<a className="listing-card__link" href={job.path}>
								<span
									className={`listing-card__media${
										image ? "" : " listing-card__media--placeholder"
									}`}
								>
									{image ? (
										<img src={image} alt="" loading="lazy" />
									) : (
										<span aria-hidden="true" />
									)}
								</span>
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
								</span>
							</a>
						</li>
					);
				})}
			</ul>
		</section>
	);
};

const PageTemplate: React.FC<PageTemplateProps> = ({ pageContext }) => {
	const {
		page,
		navigation,
		locations,
		jobs,
		categories,
		languageLinks,
		socialLinks,
	} = pageContext;
	const mainNavigation = toNavigationItems(navigation, page.language, "main");
	const footerNavigation = buildFooterNavigation(navigation, page.language);
	const languages = buildLanguageOptions(languageLinks);

	// Keep the key-based CSS hook (`.page--index`, `.page--locations`, …) stable.
	const pageClassName = `page page--${page.key}`;
	const isHomepage = page.template === "home";
	const isLocationPlan = page.template === "lageplan";

	return (
		<SiteLayout
			mainNavigation={mainNavigation}
			footerNavigation={footerNavigation}
			socialLinks={socialLinks}
			languages={languages}
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
				{isLocationPlan ? (
					<LocationPlan
						page={page}
						locations={locations}
						categories={categories}
					/>
				) : (
					<>
						<ContentBlockRenderer blocks={page.blocks} />
						<div className="page-body">
							<MarkdownContent content={page.body} />
						</div>
					</>
				)}
			</article>

			{page.template === "shops" ? (
				<LocationList
					locations={locations}
					categories={categories}
					language={page.language}
					group="brand"
					showHeader={false}
				/>
			) : null}
			{page.template === "gastronomie" ? (
				<LocationList
					locations={locations}
					categories={categories}
					language={page.language}
					group="culinary"
					showHeader={false}
				/>
			) : null}
			{page.template === "jobs" ? (
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
