import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { Seo } from "../components/seo";
import { SiteLayout } from "../layouts";
import { resolveCategoryLabels } from "../lib/content/categories";
import { MarkdownContent } from "../lib/content/markdown";
import type {
	NormalizedCategory,
	NormalizedLocation,
	SiteNavigationItem,
} from "../lib/content/types";
import type { NormalizedNavigationItem } from "../lib/navigation";
import type { ResolvedSeo } from "../lib/seo";

type LocationTemplateContext = {
	location: NormalizedLocation;
	navigation: SiteNavigationItem[];
	categories: NormalizedCategory[];
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

const getBodyExcerpt = (body?: string): string | undefined => {
	const paragraph = body
		?.split(/\n{2,}/)
		.map(stripMarkdownText)
		.find(Boolean);

	return paragraph ? truncateText(paragraph) : undefined;
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

const getLocationDetailLabel = (location: NormalizedLocation): string =>
	location.group === "culinary" ? "Zur Speisekarte" : "Gleich finden";

const LocationTemplate: React.FC<LocationTemplateProps> = ({ pageContext }) => {
	const { location, navigation, categories } = pageContext;
	const { frontmatter } = location;
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

	return (
		<SiteLayout
			mainNavigation={toNavigationItems(navigation, location.language, "main")}
			footerNavigation={toNavigationItems(
				navigation,
				location.language,
				"misc",
			)}
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
						{frontmatter.logo ? (
							<img src={frontmatter.logo} alt={`${location.title} Logo`} />
						) : (
							<h2>{location.title}</h2>
						)}
						<p className="location-detail__category-title">
							{categoryLabels.join(" · ")}
						</p>
						{bodyContent ? <p>{getBodyExcerpt(bodyContent)}</p> : null}
					</div>

					<div className="location-detail__info-card location-detail__info-card--hours">
						<span className="location-detail__info-icon" aria-hidden="true">
							◷
						</span>
						<h2>
							Öffnungs
							<br />
							zeiten
						</h2>
						{hasOpeningHours ? (
							<dl className="location-detail__mini-list">
								{frontmatter.hours?.map((entry) => (
									<div key={`${entry.date}-${entry.time}`}>
										<dt>{entry.date}</dt>
										<dd>{entry.time}</dd>
									</div>
								))}
							</dl>
						) : (
							<p>Informationen im Center.</p>
						)}
					</div>

					<div className="location-detail__info-card location-detail__info-card--contact">
						<span className="location-detail__info-icon" aria-hidden="true">
							⌖
						</span>
						<h2>Kontakt</h2>
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
							<p>Informationen im Center.</p>
						)}
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
