import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { Seo } from "../components/seo";
import { SiteLayout } from "../layouts";
import { formatPhoneLabel, getPhoneHref } from "../lib/content/contact";
import { getBodyExcerpt } from "../lib/content/excerpt";
import { resolveCategoryLabels } from "../lib/content/categories";
import { MarkdownContent, renderMultiline } from "../lib/content/markdown";
import { normalizeImageList, trim } from "../lib/content/normalize";
import type {
	LanguageLinks,
	NormalizedCategory,
	NormalizedLocation,
	SiteMenuSettings,
	SiteNavigationItem,
	SiteTheme,
} from "../lib/content/types";
import { buildLanguageOptions } from "../lib/language";
import {
	getMenuBoxesForLanguage,
	getMenuIconsForLanguage,
	getMenuSocialLinks,
	type NormalizedNavigationItem,
} from "../lib/navigation";
import {
	DEFAULT_OG_TYPE,
	DEFAULT_TWITTER_CARD_WITH_IMAGE,
	DEFAULT_TWITTER_CARD_WITHOUT_IMAGE,
	OG_LOCALE_BY_LANGUAGE,
	OG_SITE_NAME,
	type ResolvedSeo,
} from "../lib/seo";

type LocationTemplateContext = {
	location: NormalizedLocation;
	navigation: SiteNavigationItem[];
	categories: NormalizedCategory[];
	theme?: SiteTheme;
	menu?: SiteMenuSettings;
	languageLinks?: LanguageLinks;
	socialLinks?: NormalizedNavigationItem[];
	footerNavigation?: NormalizedNavigationItem[];
	footerCopyright?: string;
};

type LocationTemplateProps = PageProps<
	Record<string, never>,
	LocationTemplateContext
>;

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

const resolveLocationSeo = (location: NormalizedLocation): ResolvedSeo => {
	const seo = location.frontmatter.seo;
	const description = getLocationSeoDescription(location);
	const image =
		trim(seo?.image) ??
		normalizeImageList(location.frontmatter.images)[0] ??
		trim(location.frontmatter.logo);
	const imageAlt = trim(seo?.imageAlt) ?? trim(location.heading);
	const ogType = trim(seo?.ogType) ?? DEFAULT_OG_TYPE;
	const ogLocale =
		OG_LOCALE_BY_LANGUAGE[location.language] ?? OG_LOCALE_BY_LANGUAGE.de;
	const twitterCard =
		trim(seo?.twitterCard) ??
		(image ? DEFAULT_TWITTER_CARD_WITH_IMAGE : DEFAULT_TWITTER_CARD_WITHOUT_IMAGE);
	const noIndex = seo?.noIndex === true;

	return {
		title: location.seoTitle,
		description,
		canonicalUrl: location.path,
		openGraph: {
			title: location.seoTitle,
			description,
			url: location.path,
			image,
			imageAlt,
			type: ogType,
			locale: ogLocale,
			siteName: OG_SITE_NAME,
		},
		twitter: {
			card: twitterCard,
			title: location.seoTitle,
			description,
			image,
			imageAlt,
		},
		noIndex,
	};
};

const getLocationIntro = (location: NormalizedLocation): string | undefined =>
	location.intro?.trim() || undefined;

const getLocationSeoDescription = (location: NormalizedLocation): string =>
	trim(location.frontmatter.seo?.description) ??
	getLocationIntro(location) ??
	getBodyExcerpt(location.body) ??
	"";

const getLocationFallbackCategory = (location: NormalizedLocation): string =>
	location.group === "culinary" ? "Genuss" : "Shop";

const getLocationIndexPath = (location: NormalizedLocation): string => {
	const basePath = location.group === "culinary" ? "gastronomie" : "shops";
	return location.language === "de"
		? `/${basePath}/`
		: `/${location.language}/${basePath}/`;
};

const getLocationIndexLabel = (location: NormalizedLocation): string =>
	location.group === "culinary" ? "Alle Gastronomie" : "Alle Shops";

const getAddressLines = (address?: string | null, name?: string): string[] => {
	const lines = (address ?? "")
		.split(/\\|\n/)
		.map((line) => line.trim())
		.filter(Boolean);

	// Die erste Zeile wiederholt meist den Markennamen, der in der Kachel schon
	// als Logo steht ("Thai-Li-Ba", "Restaurant Lichtblick"). Nur die Anschrift zeigen.
	const brand = name?.trim().toLowerCase();
	if (brand && lines.length > 1 && lines[0].toLowerCase().includes(brand)) {
		return lines.slice(1);
	}

	return lines;
};

const getExternalUrl = (url?: string | null): string | undefined => {
	const value = url?.trim();

	if (!value) {
		return undefined;
	}

	if (/^(https?:|mailto:|tel:)/i.test(value)) {
		return value;
	}

	return `https://${value}`;
};

const formatUrlLabel = (url: string): string =>
	url
		.replace(/^https?:\/\//i, "")
		.replace(/^www\./i, "")
		.replace(/\/$/, "");

const formatOpeningHoursLabel = (label: string): string =>
	label.trim().replace(/\s+von$/i, "");

// Eine Zeitspanne ist eine Einheit: sonst bricht die Kachel hinter dem
// Bindestrich um und lässt "18:00-" allein am Zeilenende stehen. Geschütztes
// Leerzeichen (U+00A0) und geschützter Bindestrich (U+2011) halten sie zusammen.
const keepTimeRangesTogether = (time: string): string =>
	time
		.replace(/(\d{1,2}:\d{2}) - (\d{1,2}:\d{2})/g, "$1\u00a0\u2011\u00a0$2")
		.replace(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/g, "$1\u2011$2");

// "u." / "und" / "and" trennen zwei Zeitspannen, die beide ihr "Uhr" brauchen.
// Hinter "u." steht ein Leerzeichen, also kein \b dahinter — das wäre keine Wortgrenze.
const RANGE_SEPARATOR = /\s*\b(?:u\.|und\b|and\b)\s*/i;

const formatOpeningHoursTime = (time: string): string => {
	const normalized = time
		.trim()
		.replace(/(\d{1,2})\.(\d{2})/g, "$1:$2")
		// führende Null nur bei der Anfangszeit: "10:00 - 01:00" behält seine
		.replace(/^0(?=[1-9]:)/, "")
		.replace(/\s+/g, " ");

	if (!normalized) {
		return "";
	}

	if (/geschlossen|closed/i.test(normalized)) {
		return normalized;
	}

	const joined = normalized.replace(RANGE_SEPARATOR, " Uhr & ");

	return keepTimeRangesTogether(
		/\bUhr\s*$/i.test(joined) ? joined : `${joined} Uhr`,
	);
};

const getLocationDetailLabel = (location: NormalizedLocation): string =>
	location.group === "culinary" ? "Zur Speisekarte" : "Gleich finden";

const getLocationInfoCategoryTitle = (
	location: NormalizedLocation,
	categoryLabels: string[],
): string => {
	if (location.group === "culinary") {
		const searchText = `${location.title} ${location.body ?? ""}`.toLowerCase();

		if (
			/thai|asia|asiatisch|thailand|indonesien|vietnam|china/.test(searchText)
		) {
			return "Asiatisch";
		}
	}

	return categoryLabels.join(" · ");
};

const ClockIcon: React.FC<{ className: string }> = ({ className }) => (
	<svg
		className={className}
		viewBox="0 0 32 32"
		aria-hidden="true"
		focusable="false"
	>
		<circle cx="16" cy="16" r="11.5" />
		<path d="M16 8.5V16h6" />
		<path d="M16 4.5v2" />
		<path d="M27.5 16h-2" />
		<path d="M16 27.5v-2" />
		<path d="M4.5 16h2" />
	</svg>
);

const PinIcon: React.FC<{ className: string }> = ({ className }) => (
	<svg
		className={className}
		viewBox="0 0 32 32"
		aria-hidden="true"
		focusable="false"
	>
		<path d="M16 28s9-8.5 9-16a9 9 0 0 0-18 0c0 7.5 9 16 9 16Z" />
		<circle cx="16" cy="12" r="3" />
	</svg>
);

const LocationTemplate: React.FC<LocationTemplateProps> = ({ pageContext }) => {
	const {
		location,
		navigation,
		categories,
		theme,
		menu,
		languageLinks,
		socialLinks,
		footerNavigation,
		footerCopyright,
	} = pageContext;
	const { frontmatter } = location;
	const languages = buildLanguageOptions(languageLinks);
	const images = normalizeImageList(frontmatter.images);
	const heroImage = images[0];
	const aboutImage = images[1] ?? images[0];
	const categoryLabels = resolveCategoryLabels(
		frontmatter.categories,
		categories,
		location.language,
		getLocationFallbackCategory(location),
	);
	const locationIntro = getLocationIntro(location);
	const addressLines = getAddressLines(frontmatter.address, location.title);
	const websiteUrl = getExternalUrl(frontmatter.contact?.url);
	const hasOpeningHours = Boolean(frontmatter.hours?.length);
	const hasContact = Boolean(
		addressLines.length ||
		frontmatter.contact?.email ||
		frontmatter.contact?.phone ||
		websiteUrl,
	);
	const bodyContent = location.body ?? locationIntro;
	const infoCategoryTitle = getLocationInfoCategoryTitle(
		location,
		categoryLabels,
	);

	return (
		<SiteLayout
			theme={theme}
			menuIcons={getMenuIconsForLanguage(menu, location.language)}
			menuBoxes={getMenuBoxesForLanguage(menu, location.language)}
			menuSocialLinks={getMenuSocialLinks(menu)}
			language={location.language}
			mainNavigation={toNavigationItems(navigation, location.language, "main")}
			footerNavigation={footerNavigation}
			socialLinks={socialLinks}
			footerCopyright={footerCopyright}
			languages={languages}
			siteTitle="RathausGalerien"
		>
			<article className={`location-detail location-detail--${location.group}`}>
				<a
					className="detail-back-link location-detail__back"
					href={getLocationIndexPath(location)}
				>
					← {getLocationIndexLabel(location)}
				</a>

				<header className="location-detail__hero">
					{heroImage ? (
						<img src={heroImage} alt="" loading="eager" />
					) : (
						<div className="location-detail__hero-placeholder" />
					)}
					<h1 className="visually-hidden">{renderMultiline(location.heading)}</h1>
				</header>

				<section
					className="location-detail__info-grid"
					aria-label="Standort Informationen"
				>
					<div className="location-detail__info-card location-detail__info-card--brand">
						<div className="location-detail__info-mark">
							{frontmatter.logo ? (
								<img src={frontmatter.logo} alt={`${location.title} Logo`} />
							) : (
								<h2>{renderMultiline(location.heading)}</h2>
							)}
						</div>
						<p className="location-detail__category-title">
							{infoCategoryTitle}
						</p>
						<div className="location-detail__info-copy">
							{renderMultiline(location.intro) ? <p>{renderMultiline(location.intro)}</p> : null}
						</div>
					</div>

					<div className="location-detail__info-card location-detail__info-card--hours">
						<div className="location-detail__info-mark">
							<ClockIcon className="location-detail__info-icon" />
						</div>
						<h2>
							Öffnungs
							<br />
							zeiten
						</h2>
						<div className="location-detail__info-copy">
							{hasOpeningHours ? (
								<dl className="location-detail__mini-list">
									{frontmatter.hours?.map((entry) => {
										const label = formatOpeningHoursLabel(entry.date ?? "");
										const time = formatOpeningHoursTime(entry.time ?? "");
										const isKitchenHours = /^warme küche/i.test(label);

										return (
											<div
												className={
													isKitchenHours
														? "location-detail__mini-list-row location-detail__mini-list-row--stacked"
														: "location-detail__mini-list-row"
												}
												key={`${entry.date}-${entry.time}`}
											>
												<dt>{label}</dt>{" "}
												<dd>{time}</dd>
											</div>
										);
									})}
								</dl>
							) : (
								<p>Informationen im Center.</p>
							)}
						</div>
					</div>

					<div className="location-detail__info-card location-detail__info-card--contact">
						<div className="location-detail__info-mark">
							<PinIcon className="location-detail__info-icon" />
						</div>
						<h2>Kontakt</h2>
						<div className="location-detail__info-copy">
							{hasContact ? (
								<>
									{addressLines.length ? (
										<address>
											{addressLines.map((line) => (
												<React.Fragment key={line}>
													{line}
													<br />
												</React.Fragment>
											))}
										</address>
									) : null}
									<ul>
										{frontmatter.contact?.phone ? (
											<li>
												<a href={getPhoneHref(frontmatter.contact.phone)}>
													{formatPhoneLabel(frontmatter.contact.phone)}
												</a>
											</li>
										) : null}
										{frontmatter.contact?.email ? (
											<li>
												<a href={`mailto:${frontmatter.contact.email}`}>
													{frontmatter.contact.email}
												</a>
											</li>
										) : null}
										{websiteUrl ? (
											<li>
												<a href={websiteUrl} target="_blank" rel="noreferrer">
													{formatUrlLabel(websiteUrl)}
												</a>
											</li>
										) : null}
									</ul>
								</>
							) : (
								<p>Kontaktinformationen folgen.</p>
							)}
						</div>
					</div>
				</section>

				{bodyContent ? (
					<section
						className={`location-detail__about${
							aboutImage ? " location-detail__about--has-media" : ""
						}`}
						aria-labelledby="location-about-title"
					>
						<div className="location-detail__about-copy">
							<h2 id="location-about-title">{renderMultiline(location.heading)}</h2>
							<div className="detail-rich-text">
								<MarkdownContent content={bodyContent} />
							</div>
							<a
								className="location-detail__text-link"
								href={getLocationIndexPath(location)}
							>
								{getLocationDetailLabel(location)}
							</a>
						</div>
						{aboutImage ? (
							<div className="location-detail__about-media">
								<img src={aboutImage} alt="" loading="lazy" />
							</div>
						) : null}
					</section>
				) : null}

			</article>
		</SiteLayout>
	);
};

export default LocationTemplate;

export const Head: HeadFC<Record<string, never>, LocationTemplateContext> = ({
	pageContext,
}) => (
	<Seo
		seo={resolveLocationSeo(pageContext.location)}
		language={pageContext.location.language}
	/>
);
