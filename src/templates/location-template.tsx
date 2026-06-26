import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { Seo } from "../components/seo";
import { SiteLayout } from "../layouts";
import { resolveCategoryLabels } from "../lib/content/categories";
import { MarkdownContent } from "../lib/content/markdown";
import type {
	LanguageLinks,
	NormalizedCategory,
	NormalizedLocation,
	SiteNavigationItem,
} from "../lib/content/types";
import { buildFooterNavigation } from "../lib/footer";
import { buildLanguageOptions } from "../lib/language";
import type { NormalizedNavigationItem } from "../lib/navigation";
import type { ResolvedSeo } from "../lib/seo";

type LocationTemplateContext = {
	location: NormalizedLocation;
	navigation: SiteNavigationItem[];
	categories: NormalizedCategory[];
	languageLinks?: LanguageLinks;
	socialLinks?: NormalizedNavigationItem[];
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
	const description = getLocationSeoDescription(location);

	return {
		title: location.title,
		description,
		canonicalUrl: location.path,
		openGraph: {
			title: location.title,
			description,
		},
	};
};

const isGenericLocationDescription = (description: string): boolean =>
	/^Hier finden Sie Informationen zu .+? in den RathausGalerien\.?$/i.test(
		description.trim(),
	);

const getCleanLocationDescription = (
	location: NormalizedLocation,
): string | undefined => {
	const description = location.description?.trim();

	if (!description || isGenericLocationDescription(description)) {
		return undefined;
	}

	return description;
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

const getBodyExcerpt = (body?: string, maxLength = 155): string | undefined => {
	const paragraph = body
		?.split(/\n{2,}/)
		.map(stripMarkdownText)
		.find(Boolean);

	return paragraph ? truncateText(paragraph, maxLength) : undefined;
};

const getLocationSeoDescription = (location: NormalizedLocation): string =>
	getCleanLocationDescription(location) ?? getBodyExcerpt(location.body) ?? "";

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

const getAddressLines = (address?: string | null): string[] =>
	(address ?? "")
		.split(/\\|\n/)
		.map((line) => line.trim())
		.filter(Boolean);

const getPhoneHref = (phone: string): string => {
	const value = phone.trim().replace(/^tel:/, "");
	return `tel:${value.replace(/[^+\d]/g, "")}`;
};

const formatPhoneLabel = (phone: string): string =>
	phone.replace(/^tel:/, "").trim();

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

const formatOpeningHoursTime = (time: string, label: string): string => {
	const normalized = time
		.trim()
		.replace(/(\d{1,2})\.(\d{2})/g, "$1:$2")
		.replace(/\s+/g, " ");

	if (!normalized) {
		return "";
	}

	if (/geschlossen/i.test(normalized)) {
		return normalized;
	}

	if (/warme küche/i.test(label) && /\bu\.\b/i.test(normalized)) {
		return `${normalized.replace(/\s*u\.\s*/i, " Uhr & ")} Uhr`;
	}

	return /\bUhr\b/i.test(normalized) ? normalized : `${normalized} Uhr`;
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
	const { location, navigation, categories, languageLinks, socialLinks } =
		pageContext;
	const { frontmatter } = location;
	const languages = buildLanguageOptions(languageLinks);
	const images = frontmatter.images ?? [];
	const heroImage = images[0];
	const aboutImage = images[1] ?? images[0];
	const galleryImages = images.slice(2);
	const categoryLabels = resolveCategoryLabels(
		frontmatter.categories,
		categories,
		location.language,
		getLocationFallbackCategory(location),
	);
	const cleanDescription = getCleanLocationDescription(location);
	const addressLines = getAddressLines(frontmatter.address);
	const websiteUrl = getExternalUrl(frontmatter.contact?.url);
	const hasOpeningHours = Boolean(frontmatter.hours?.length);
	const hasContact = Boolean(
		addressLines.length ||
		frontmatter.contact?.email ||
		frontmatter.contact?.phone ||
		websiteUrl,
	);
	const bodyContent = location.body ?? cleanDescription;
	const infoTileExcerpt = getBodyExcerpt(bodyContent, 112);
	const infoCategoryTitle = getLocationInfoCategoryTitle(
		location,
		categoryLabels,
	);

	return (
		<SiteLayout
			mainNavigation={toNavigationItems(navigation, location.language, "main")}
			footerNavigation={buildFooterNavigation(navigation, location.language)}
			socialLinks={socialLinks}
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
					<h1 className="visually-hidden">{location.title}</h1>
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
								<h2>{location.title}</h2>
							)}
						</div>
						<p className="location-detail__category-title">
							{infoCategoryTitle}
						</p>
						<div className="location-detail__info-copy">
							{infoTileExcerpt ? <p>{infoTileExcerpt}</p> : null}
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
										const time = formatOpeningHoursTime(
											entry.time ?? "",
											label,
										);
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
												<dt>{label}</dt>
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
							<h2 id="location-about-title">{location.title}</h2>
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

				{galleryImages.length ? (
					<section
						className="detail-gallery location-detail__gallery"
						aria-labelledby="location-gallery-title"
					>
						<p className="detail-panel__eyebrow">Galerie</p>
						<h2 id="location-gallery-title">Eindrücke</h2>
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

export default LocationTemplate;

export const Head: HeadFC<Record<string, never>, LocationTemplateContext> = ({
	pageContext,
}) => (
	<Seo
		seo={resolveLocationSeo(pageContext.location)}
		language={pageContext.location.language}
	/>
);
