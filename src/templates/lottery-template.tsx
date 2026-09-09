import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { Seo } from "../components/seo";
import { SiteLayout } from "../layouts";
import { LotteryForm } from "../components/form";
import { MarkdownContent, renderMultiline } from "../lib/content/markdown";
import { normalizeImageList, trim } from "../lib/content/normalize";
import type {
	LanguageCode,
	LanguageLinks,
	LotterySettings,
	NormalizedLottery,
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

type LotteryTemplateContext = {
	lottery: NormalizedLottery;
	lotterySettings: LotterySettings | null;
	navigation: SiteNavigationItem[];
	theme?: SiteTheme;
	languageLinks?: LanguageLinks;
	socialLinks?: NormalizedNavigationItem[];
};

type LotteryTemplateProps = PageProps<
	Record<string, never>,
	LotteryTemplateContext
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

const getLotteryFallbackImage = (
	lottery: NormalizedLottery,
): string | undefined => normalizeImageList(lottery.frontmatter.images)[0];

const formatLotteryDate = (date: string, language: LanguageCode): string => {
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

const getLotterySeoDescription = (lottery: NormalizedLottery): string =>
	trim(lottery.frontmatter.seo?.description) ?? lottery.intro ?? "";

const resolveLotterySeo = (lottery: NormalizedLottery): ResolvedSeo => {
	const seo = lottery.frontmatter.seo;
	const description = getLotterySeoDescription(lottery);
	const title = trim(seo?.title) ?? lottery.title;
	const image = trim(seo?.image) ?? getLotteryFallbackImage(lottery);
	const imageAlt = trim(seo?.imageAlt) ?? trim(lottery.heading);
	const ogType = trim(seo?.ogType) ?? DEFAULT_OG_TYPE;
	const ogLocale =
		OG_LOCALE_BY_LANGUAGE[lottery.language] ?? OG_LOCALE_BY_LANGUAGE.de;
	const twitterCard =
		trim(seo?.twitterCard) ??
		(image ? DEFAULT_TWITTER_CARD_WITH_IMAGE : DEFAULT_TWITTER_CARD_WITHOUT_IMAGE);
	const noIndex = seo?.noIndex === true;

	return {
		title,
		description,
		canonicalUrl: lottery.path,
		openGraph: {
			title,
			description,
			url: lottery.path,
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

const getHomeUrl = (language: LanguageCode): string =>
	language === "de" ? "/" : `/${language}/`;

const LotteryTemplate: React.FC<LotteryTemplateProps> = ({ pageContext }) => {
	const { lottery, navigation, theme, languageLinks, socialLinks } =
		pageContext;
	const languages = buildLanguageOptions(languageLinks);
	const heroImage = getLotteryFallbackImage(lottery);
	const date = lottery.date
		? formatLotteryDate(lottery.date, lottery.language)
		: undefined;

	return (
		<SiteLayout
			theme={theme}
			mainNavigation={toNavigationItems(navigation, lottery.language, "main")}
			footerNavigation={buildFooterNavigation(navigation, lottery.language)}
			socialLinks={socialLinks}
			languages={languages}
			siteTitle="RathausGalerien"
		>
			<article className="lottery-detail">
				<header className="lottery-detail__hero">
					{heroImage ? (
						<img src={heroImage} alt="" loading="eager" />
					) : (
						<div className="lottery-detail__hero-placeholder" />
					)}
				</header>

				<header className="page-hero">
					{date ? <p className="lottery-detail__date">{date}</p> : null}
					<h1 className="page-hero__title">
						{renderMultiline(lottery.heading)}
					</h1>
					{lottery.intro ? (
						<p className="page-hero__description">
							{renderMultiline(lottery.intro)}
						</p>
					) : null}
				</header>

				{lottery.body ? (
					<div className="lottery-detail__body detail-rich-text">
						<MarkdownContent content={lottery.body} />
					</div>
				) : null}

				{lottery.form ? (
					<section
						className="lottery-detail__form-panel detail-panel"
						aria-label={lottery.heading}
					>
						<LotteryForm
							form={lottery.form}
							homeUrl={getHomeUrl(lottery.language)}
							language={lottery.language}
						/>
					</section>
				) : null}
			</article>
		</SiteLayout>
	);
};

export default LotteryTemplate;

export const Head: HeadFC<Record<string, never>, LotteryTemplateContext> = ({
	pageContext,
}) => (
	<Seo
		seo={resolveLotterySeo(pageContext.lottery)}
		language={pageContext.lottery.language}
	/>
);
