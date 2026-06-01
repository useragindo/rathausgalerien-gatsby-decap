import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { ContentBlockRenderer } from "../components/content-blocks";
import { Seo } from "../components/seo";
import { SiteLayout } from "../layouts";
import type { NavigationSettings, PageFrontmatter, SiteSettings } from "../lib/cms";
import { getNavigationForLanguage } from "../lib/navigation";
import { resolveSeo } from "../lib/seo";

type PageTemplateContext = {
	frontmatter?: PageFrontmatter | null;
	settings?: SiteSettings | null;
	navigation?: NavigationSettings | null;
};

type PageTemplateProps = PageProps<Record<string, never>, PageTemplateContext>;

const PageTemplate: React.FC<PageTemplateProps> = ({ pageContext }) => {
	const frontmatter = pageContext.frontmatter ?? {};
	const settings = pageContext.settings ?? {};
	const navigation = getNavigationForLanguage(
		pageContext.navigation ?? {},
		frontmatter.language ?? settings.defaultLanguage ?? "de",
	);

	return (
		<SiteLayout
			mainNavigation={navigation.mainNavigation}
			utilityNavigation={navigation.utilityNavigation}
			headerIconNavigation={navigation.headerIconNavigation}
			footerNavigation={navigation.footerNavigation}
			footerLegalNavigation={navigation.footerLegalNavigation}
			socialLinks={navigation.socialLinks}
			siteTitle={settings.siteTitle ?? undefined}
		>
			{frontmatter.title ? <h1>{frontmatter.title}</h1> : null}
			{frontmatter.hero?.text ? <p>{frontmatter.hero.text}</p> : null}
			<ContentBlockRenderer blocks={frontmatter.contentBlocks} />
		</SiteLayout>
	);
};

export default PageTemplate;

export const Head: HeadFC<Record<string, never>, PageTemplateContext> = ({ pageContext }) => {
	const frontmatter = pageContext.frontmatter ?? {};
	const settings = pageContext.settings ?? {};
	const seo = resolveSeo(frontmatter, settings);

	return <Seo seo={seo} language={frontmatter.language ?? settings.defaultLanguage ?? "de"} />;
};
