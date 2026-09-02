import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { ContentBlockRenderer } from "../components/content-blocks";
import { LocationPlan } from "../components/location-plan";
import { Seo } from "../components/seo";
import { SiteLayout } from "../layouts";
import {
	normalizeCategoryKey,
	resolveCategories,
	resolveCategoryLabels,
} from "../lib/content/categories";
import { MarkdownContent, renderMultiline } from "../lib/content/markdown";
import { trim } from "../lib/content/normalize";
import type {
	LanguageCode,
	LanguageLinks,
	NormalizedCategory,
	NormalizedJob,
	NormalizedLocation,
	NormalizedNews,
	NormalizedPage,
	SiteNavigationItem,
	SiteTheme,
} from "../lib/content/types";
import { buildFooterNavigation } from "../lib/footer";
import { buildLanguageOptions } from "../lib/language";
import type { NormalizedNavigationItem } from "../lib/navigation";
import type { ResolvedSeo } from "../lib/seo";
import {
	DEFAULT_OG_TYPE,
	DEFAULT_TWITTER_CARD_WITH_IMAGE,
	DEFAULT_TWITTER_CARD_WITHOUT_IMAGE,
	OG_LOCALE_BY_LANGUAGE,
	OG_SITE_NAME,
} from "../lib/seo";

type PageTemplateContext = {
	page: NormalizedPage;
	navigation: SiteNavigationItem[];
	locations: NormalizedLocation[];
	jobs: NormalizedJob[];
	news: NormalizedNews[];
	categories: NormalizedCategory[];
	theme?: SiteTheme;
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

const getFirstBlockImage = (
	blocks: NormalizedPage["blocks"],
): string | undefined => {
	for (const block of blocks) {
		const firstImage = block.images?.[0]?.image;
		const image = trim(firstImage);
		if (image) {
			return image;
		}
	}
	return undefined;
};

const resolvePageSeo = (page: NormalizedPage): ResolvedSeo => {
	const seo = page.frontmatter.seo;
	const funnelUrl = trim(page.frontmatter.funnel_url);
	const canonicalUrl = funnelUrl ?? page.path;
	const title = trim(seo?.title) ?? page.title;
	const description = trim(seo?.description) ?? page.description ?? "";
	const image =
		trim(seo?.image) ??
		trim(page.frontmatter.teaser?.image) ??
		getFirstBlockImage(page.blocks);
	const imageAlt =
		trim(seo?.imageAlt) ??
		trim(page.frontmatter.teaser?.title) ??
		trim(page.heading);
	const ogType = trim(seo?.ogType) ?? DEFAULT_OG_TYPE;
	const ogLocale = OG_LOCALE_BY_LANGUAGE[page.language] ?? OG_LOCALE_BY_LANGUAGE.de;
	const twitterCard =
		trim(seo?.twitterCard) ??
		(image ? DEFAULT_TWITTER_CARD_WITH_IMAGE : DEFAULT_TWITTER_CARD_WITHOUT_IMAGE);
	const noIndex = seo?.noIndex === true;
	return {
		title,
		description,
		canonicalUrl,
		openGraph: {
			title,
			description,
			url: canonicalUrl,
			image,
			imageAlt,
			type: ogType,
			locale: ogLocale,
			siteName: OG_SITE_NAME,
		},
		twitter: {
			card: twitterCard,
			title,
			description,
			image,
			imageAlt,
		},
		noIndex,
	};
};

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
	const intro = location.intro ? stripMarkdown(location.intro) : undefined;
	const text =
		bodyText || intro || `${location.title} in den RathausGalerien.`;

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
	categoryUuid?: string,
): LocationListingCard[] => {
	const fallbackLabel = group === "culinary" ? "Genuss" : "Shop";
	const normalizedTargetUuid = categoryUuid?.trim().toLowerCase();
	return locations
		.filter(
			(location) => location.language === language && location.group === group,
		)
		.sort((a, b) => a.title.localeCompare(b.title))
		.flatMap((location) => {
			const resolvedCategories = resolveCategories(
				location.frontmatter.categories,
				categories,
				language,
			);

			if (normalizedTargetUuid) {
				const matchedCategory = resolvedCategories.find(
					(category) =>
						category.uuid.trim().toLowerCase() === normalizedTargetUuid,
				);

				if (!matchedCategory) {
					return [];
				}

				return [
					{
						location,
						categoryLabel: matchedCategory.name,
						categoryKey: normalizeCategoryKey(matchedCategory.name),
					},
				];
			}

			const cardLabels = resolvedCategories.map((category) => category.name);
			const labels = cardLabels.length ? cardLabels : [fallbackLabel];

			return labels.map((categoryLabel) => ({
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
	categoryUuid?: string;
};

export const LocationList: React.FC<LocationListProps> = ({
	locations,
	categories,
	language,
	group,
	showHeader = true,
	categoryUuid,
}) => {
	const items = React.useMemo(
		() =>
			getLocationListingCards(
				locations,
				categories,
				language,
				group,
				categoryUuid,
			),
		[locations, categories, language, group, categoryUuid],
	);
	const title = group === "culinary" ? "Gastronomie" : "Shops";
	const description =
		group === "culinary"
			? "Restaurants, Bars und Cafés mitten in den RathausGalerien."
			: "Marken, Services und Boutiquen im Zentrum von Innsbruck.";
	const hasCategoryFilter = group === "brand" && !categoryUuid;
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
	<img
		src="/icons/shopping-bag.svg"
		alt=""
		aria-hidden="true"
		loading="eager"
	/>
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
				<h1 id="home-intro-title">{renderMultiline(page.heading)}</h1>
				<p>{countLabel}</p>
				<p>Mitten in Innsbruck</p>
			</div>
			{page.intro ? (
				<p className="home-intro__description">{renderMultiline(page.intro)}</p>
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

const getNewsImage = (news: NormalizedNews): string | undefined =>
	trim(news.frontmatter.seo?.image) ?? getMarkdownImage(news.body);

const formatNewsDate = (date: string, language: string): string | undefined => {
	const parsed = new Date(date);

	if (Number.isNaN(parsed.getTime())) {
		return undefined;
	}

	return new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(
		parsed,
	);
};

const NewsList: React.FC<{ news: NormalizedNews[]; language: string }> = ({
	news,
	language,
}) => {
	const items = React.useMemo(
		() =>
			news
				.filter((item) => item.language === language)
				.sort((a, b) => {
					if (!a.date && !b.date) return 0;
					if (!a.date) return 1;
					if (!b.date) return -1;
					return b.date.localeCompare(a.date);
				}),
		[news, language],
	);

	if (!items.length) {
		return null;
	}

	return (
		<section
			className="listing-section listing-section--news"
			aria-labelledby="news-list-title"
		>
			<header className="listing-section__header">
				<p className="listing-section__eyebrow">Aktuelles</p>
				<h2 id="news-list-title">News</h2>
			</header>
			<ul className="listing-grid listing-grid--news">
				{items.map((item) => {
					const image = getNewsImage(item);
					const date = item.date ? formatNewsDate(item.date, language) : undefined;

					return (
						<li
							className="listing-card listing-card--news listing-card--has-media"
							key={item.id}
						>
							<a className="listing-card__link" href={item.path}>
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
									{date ? (
										<span className="news-card__date">{date}</span>
									) : null}
									<span className="listing-card__title">{renderMultiline(item.heading)}</span>
									{item.intro ? (
										<span className="listing-card__text">{renderMultiline(item.intro)}</span>
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
		news,
		categories,
		theme,
		languageLinks,
		socialLinks,
	} = pageContext;
	const mainNavigation = toNavigationItems(navigation, page.language, "main");
	const footerNavigation = buildFooterNavigation(navigation, page.language);
	const languages = buildLanguageOptions(languageLinks);

	// Keep the key-based CSS hook (`.page--index`, `.page--locations`, …) stable.
	const pageClassName = `page page--${page.key}`;
	const isHomepage = page.template === "home" || page.template === "funnel";
	const isLocationPlan = page.template === "lageplan";

	return (
		<SiteLayout
			theme={theme}
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
						<h1 className="page-hero__title">{renderMultiline(page.heading)}</h1>
						{page.intro ? (
							<p className="page-hero__description">{renderMultiline(page.intro)}</p>
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
						<ContentBlockRenderer
							blocks={page.blocks}
							language={page.language}
							categories={categories}
							theme={theme}
						/>
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
			{page.template === "news_list" ? (
				<NewsList news={news} language={page.language} />
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
