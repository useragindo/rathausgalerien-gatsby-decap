import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { Seo } from "../components/seo";
import { SiteLayout } from "../layouts";
import type {
	LanguageLinks,
	LanguageCode,
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
import type { ResolvedSeo } from "../lib/seo";
import { LocationList } from "./page-template";

type CategoryTemplateContext = {
	category: NormalizedCategory;
	navigation: SiteNavigationItem[];
	locations: NormalizedLocation[];
	categories: NormalizedCategory[];
	theme?: SiteTheme;
	menu?: SiteMenuSettings;
	languageLinks: LanguageLinks;
	socialLinks?: NormalizedNavigationItem[];
	footerNavigation?: NormalizedNavigationItem[];
	footerCopyright?: string;
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
		menu,
		languageLinks,
		socialLinks,
		footerNavigation,
		footerCopyright,
	} = pageContext;
	const mainNavigation = toNavigationItems(navigation, category.language, "main");
	const languages = buildLanguageOptions(languageLinks);

	return (
		<SiteLayout
			theme={theme}
			menuIcons={getMenuIconsForLanguage(menu, category.language)}
			menuBoxes={getMenuBoxesForLanguage(menu, category.language)}
			menuSocialLinks={getMenuSocialLinks(menu)}
			language={category.language}
			mainNavigation={mainNavigation}
			footerNavigation={footerNavigation}
			socialLinks={socialLinks}
			footerCopyright={footerCopyright}
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
					theme={theme}
				/>
				<LocationList
					locations={locations}
					categories={categories}
					language={category.language}
					group="culinary"
					showHeader={false}
					categoryUuid={category.uuid}
					theme={theme}
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
