import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { Seo } from "../components/seo";
import { SiteLayout } from "../layouts";
import type {
	LanguageLinks,
	LanguageCode,
	NormalizedCategory,
	NormalizedLocation,
	SiteNavigationItem,
	SiteTheme,
} from "../lib/content/types";
import { buildFooterNavigation } from "../lib/footer";
import { buildLanguageOptions } from "../lib/language";
import type { NormalizedNavigationItem } from "../lib/navigation";
import type { ResolvedSeo } from "../lib/seo";
import { LocationList } from "./page-template";

type CategoryTemplateContext = {
	category: NormalizedCategory;
	navigation: SiteNavigationItem[];
	locations: NormalizedLocation[];
	categories: NormalizedCategory[];
	theme?: SiteTheme;
	languageLinks: LanguageLinks;
	socialLinks?: NormalizedNavigationItem[];
};

type CategoryTemplateProps = PageProps<
	Record<string, never>,
	CategoryTemplateContext
>;

const toNavigationItems = (
	items: SiteNavigationItem[],
	language: LanguageCode,
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

const resolveCategorySeo = (
	category: NormalizedCategory,
	language: LanguageCode,
): ResolvedSeo => {
	const title =
		language === "de"
			? `${category.name} – RathausGalerien Innsbruck`
			: `${category.name} – RathausGalerien Innsbruck`;

	return {
		title,
		description: "",
		canonicalUrl: `/${language === "de" ? "" : `${language}/`}category/${category.slug}/`,
		openGraph: {
			title,
			description: "",
		},
	};
};

const CategoryTemplate: React.FC<CategoryTemplateProps> = ({ pageContext }) => {
	const {
		category,
		navigation,
		locations,
		categories,
		theme,
		languageLinks,
		socialLinks,
	} = pageContext;
	const mainNavigation = toNavigationItems(navigation, category.language, "main");
	const footerNavigation = buildFooterNavigation(navigation, category.language);
	const languages = buildLanguageOptions(languageLinks);

	return (
		<SiteLayout
			theme={theme}
			mainNavigation={mainNavigation}
			footerNavigation={footerNavigation}
			socialLinks={socialLinks}
			languages={languages}
			siteTitle="RathausGalerien"
		>
			<article className="page page--category">
				<header className="page-hero">
					<h1 className="page-hero__title">{category.name}</h1>
				</header>
				<LocationList
					locations={locations}
					categories={categories}
					language={category.language}
					group="brand"
					showHeader={false}
					categoryUuid={category.uuid}
				/>
				<LocationList
					locations={locations}
					categories={categories}
					language={category.language}
					group="culinary"
					showHeader={false}
					categoryUuid={category.uuid}
				/>
			</article>
		</SiteLayout>
	);
};

export default CategoryTemplate;

export const Head: HeadFC<Record<string, never>, CategoryTemplateContext> = ({
	pageContext,
}) => (
	<Seo
		seo={resolveCategorySeo(pageContext.category, pageContext.category.language)}
		language={pageContext.category.language}
	/>
);
