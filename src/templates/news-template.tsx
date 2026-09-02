import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { Seo } from "../components/seo";
import { SiteLayout } from "../layouts";
import { MarkdownContent, renderMultiline } from "../lib/content/markdown";
import { trim } from "../lib/content/normalize";
import type {
	LanguageCode,
	LanguageLinks,
	NormalizedNews,
	SiteNavigationItem,
	SiteTheme,
} from "../lib/content/types";
import { buildFooterNavigation } from "../lib/footer";
import { buildLanguageOptions } from "../lib/language";
import type { NormalizedNavigationItem } from "../lib/navigation";
import {
	DEFAULT_OG_TYPE,
	DEFAULT_TWITTER_CARD_WITH_IMAGE,
	DEFAULT_TWITTER_CARD_WITHOUT_IMAGE,
	OG_LOCALE_BY_LANGUAGE,
	OG_SITE_NAME,
	type ResolvedSeo,
} from "../lib/seo";

type NewsTemplateContext = {
	news: NormalizedNews;
	navigation: SiteNavigationItem[];
	theme?: SiteTheme;
	languageLinks?: LanguageLinks;
	socialLinks?: NormalizedNavigationItem[];
};

type NewsTemplateProps = PageProps<Record<string, never>, NewsTemplateContext>;

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

const getNewsFallbackImage = (news: NormalizedNews): string | undefined =>
	trim(news.frontmatter.images?.[0]) ?? getMarkdownImage(news.body);

const formatNewsDate = (date: string, language: LanguageCode): string => {
	const parsed = new Date(date);

	if (Number.isNaN(parsed.getTime())) {
		return date;
	}

	const locale = language === "de" ? "de-AT" : "en";
	return new Intl.DateTimeFormat(locale, {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(parsed);
};

const getNewsSeoDescription = (news: NormalizedNews): string =>
	trim(news.frontmatter.seo?.description) ?? news.intro ?? "";

const resolveNewsSeo = (news: NormalizedNews): ResolvedSeo => {
	const seo = news.frontmatter.seo;
	const description = getNewsSeoDescription(news);
	const title = trim(seo?.title) ?? news.title;
	const image = trim(seo?.image) ?? getNewsFallbackImage(news);
	const imageAlt = trim(seo?.imageAlt) ?? trim(news.heading);
	const ogType = trim(seo?.ogType) ?? DEFAULT_OG_TYPE;
	const ogLocale = OG_LOCALE_BY_LANGUAGE[news.language] ?? OG_LOCALE_BY_LANGUAGE.de;
	const twitterCard =
		trim(seo?.twitterCard) ??
		(image ? DEFAULT_TWITTER_CARD_WITH_IMAGE : DEFAULT_TWITTER_CARD_WITHOUT_IMAGE);
	const noIndex = seo?.noIndex === true;

	return {
		title,
		description,
		canonicalUrl: news.path,
		openGraph: {
			title,
			description,
			url: news.path,
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

const getNewsIndexPath = (news: NormalizedNews): string =>
	news.language === "de" ? "/news/" : `/${news.language}/news/`;

const getNewsIndexLabel = (news: NormalizedNews): string =>
	news.language === "de" ? "Alle News" : "All news";

const NewsTemplate: React.FC<NewsTemplateProps> = ({ pageContext }) => {
	const { news, navigation, theme, languageLinks, socialLinks } = pageContext;
	const languages = buildLanguageOptions(languageLinks);
	const images = news.frontmatter.images ?? [];
	const heroImage = images[0];
	const aboutImage = images[1] ?? images[0];
	const galleryImages = images.slice(2);
	const date = news.date ? formatNewsDate(news.date, news.language) : undefined;

	return (
		<SiteLayout
			theme={theme}
			mainNavigation={toNavigationItems(navigation, news.language, "main")}
			footerNavigation={buildFooterNavigation(navigation, news.language)}
			socialLinks={socialLinks}
			languages={languages}
			siteTitle="RathausGalerien"
		>
			<article className="news-detail">
				<a
					className="detail-back-link news-detail__back"
					href={getNewsIndexPath(news)}
				>
					← {getNewsIndexLabel(news)}
				</a>

				<header className="news-detail__hero">
					{heroImage ? (
						<img src={heroImage} alt="" loading="eager" />
					) : (
						<div className="news-detail__hero-placeholder" />
					)}
				</header>

				<header className="page-hero">
					<h1 className="page-hero__title">{renderMultiline(news.heading)}</h1>
					{date ? <p className="news-detail__date">{date}</p> : null}
					{news.intro ? (
						<p className="page-hero__description">{renderMultiline(news.intro)}</p>
					) : null}
				</header>

				{news.body || aboutImage ? (
					<section
						className={`news-detail__about${
							aboutImage ? " news-detail__about--has-media" : ""
						}`}
						aria-label={news.heading}
					>
						<div className="news-detail__about-copy">
							{news.body ? (
								<div className="detail-rich-text">
									<MarkdownContent content={news.body} />
								</div>
							) : null}
						</div>
						{aboutImage ? (
							<div className="news-detail__about-media">
								<img src={aboutImage} alt="" loading="lazy" />
							</div>
						) : null}
					</section>
				) : null}

				{galleryImages.length ? (
					<section
						className="detail-gallery news-detail__gallery"
						aria-labelledby="news-gallery-title"
					>
						<p className="detail-panel__eyebrow">Galerie</p>
						<h2 id="news-gallery-title">Eindrücke</h2>
						<ul className="detail-gallery__grid">
							{galleryImages.map((galleryImage) => (
								<li key={galleryImage}>
									<img src={galleryImage} alt="" loading="lazy" />
								</li>
							))}
						</ul>
					</section>
				) : null}
			</article>
		</SiteLayout>
	);
};

export default NewsTemplate;

export const Head: HeadFC<Record<string, never>, NewsTemplateContext> = ({
	pageContext,
}) => (
	<Seo seo={resolveNewsSeo(pageContext.news)} language={pageContext.news.language} />
);
