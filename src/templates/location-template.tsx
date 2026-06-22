import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { Seo } from "../components/seo";
import { SiteLayout } from "../layouts";
import { MarkdownContent } from "../lib/content/markdown";
import type { NormalizedLocation, SiteNavigationItem } from "../lib/content/types";
import type { NormalizedNavigationItem } from "../lib/navigation";
import type { ResolvedSeo } from "../lib/seo";

type LocationTemplateContext = {
	location: NormalizedLocation;
	navigation: SiteNavigationItem[];
};

type LocationTemplateProps = PageProps<Record<string, never>, LocationTemplateContext>;

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

const resolveLocationSeo = (location: NormalizedLocation): ResolvedSeo => ({
	title: location.title,
	description: location.description ?? "",
	canonicalUrl: location.path,
	openGraph: {
		title: location.title,
		description: location.description ?? "",
	},
});

const LocationTemplate: React.FC<LocationTemplateProps> = ({ pageContext }) => {
	const { location, navigation } = pageContext;
	const { frontmatter } = location;

	return (
		<SiteLayout
			mainNavigation={toNavigationItems(navigation, location.language, "main")}
			footerNavigation={toNavigationItems(navigation, location.language, "misc")}
			siteTitle="RathausGalerien"
		>
			<article>
				<header>
					{frontmatter.logo ? <img src={frontmatter.logo} alt="" loading="lazy" /> : null}
					<h1>{location.title}</h1>
					{location.description ? <p>{location.description}</p> : null}
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

				<MarkdownContent content={location.body} />

				{frontmatter.hours?.length ? (
					<section aria-labelledby="opening-hours-title">
						<h2 id="opening-hours-title">Öffnungszeiten</h2>
						<dl>
							{frontmatter.hours.map((entry) => (
								<React.Fragment key={`${entry.date}-${entry.time}`}>
									<dt>{entry.date}</dt>
									<dd>{entry.time}</dd>
								</React.Fragment>
							))}
						</dl>
					</section>
				) : null}

				{frontmatter.contact || frontmatter.address ? (
					<section aria-labelledby="contact-title">
						<h2 id="contact-title">Kontakt</h2>
						{frontmatter.address ? <address>{frontmatter.address}</address> : null}
						<ul>
							{frontmatter.contact?.email ? (
								<li>
									<a href={`mailto:${frontmatter.contact.email}`}>{frontmatter.contact.email}</a>
								</li>
							) : null}
							{frontmatter.contact?.phone ? (
								<li>
									<a href={frontmatter.contact.phone}>{frontmatter.contact.phone.replace(/^tel:/, "")}</a>
								</li>
							) : null}
							{frontmatter.contact?.url ? (
								<li>
									<a href={frontmatter.contact.url}>Website</a>
								</li>
							) : null}
						</ul>
					</section>
				) : null}
			</article>
		</SiteLayout>
	);
};

export default LocationTemplate;

export const Head: HeadFC<Record<string, never>, LocationTemplateContext> = ({ pageContext }) => (
	<Seo seo={resolveLocationSeo(pageContext.location)} language={pageContext.location.language} />
);
