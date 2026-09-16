import * as React from "react";
import { Footer } from "../components/footer/footer";
import { Header } from "../components/header/header";
import { ThemeStyle } from "../components/theme/theme-style";
import type {
	ImportedContentTile,
	LanguageCode,
	SiteTheme,
} from "../lib/content/types";
import type { MenuIcon, NormalizedNavigationItem } from "../lib/navigation";

type SiteLayoutProps = {
	children: React.ReactNode;
	theme?: SiteTheme | null;
	mainNavigation?: NormalizedNavigationItem[];
	utilityNavigation?: NormalizedNavigationItem[];
	menuIcons?: MenuIcon[];
	menuBoxes?: ImportedContentTile[];
	menuSocialLinks?: NormalizedNavigationItem[];
	footerNavigation?: NormalizedNavigationItem[];
	footerLegalNavigation?: NormalizedNavigationItem[];
	socialLinks?: NormalizedNavigationItem[];
	footerCopyright?: string;
	languages?: { code: string; label: string; url: string }[];
	language?: LanguageCode;
	homeUrl?: string;
	siteTitle?: string;
};

export const SiteLayout: React.FC<SiteLayoutProps> = ({
	children,
	theme,
	mainNavigation = [],
	utilityNavigation = [],
	menuIcons = [],
	menuBoxes = [],
	menuSocialLinks = [],
	footerNavigation = [],
	footerLegalNavigation = [],
	socialLinks = [],
	footerCopyright,
	languages,
	language,
	homeUrl = "/",
	siteTitle = "RathausGalerien",
}) => (
	<div className="site-shell">
		<ThemeStyle theme={theme} />
		<a className="skip-link" href="#main-content">
			Zum Inhalt springen
		</a>
		<Header
			mainNavigation={mainNavigation}
			utilityNavigation={utilityNavigation}
			menuIcons={menuIcons}
			menuBoxes={menuBoxes}
			menuSocialLinks={menuSocialLinks}
			language={language}
			theme={theme}
			socialLinks={socialLinks}
			languages={languages}
			homeUrl={homeUrl}
			siteTitle={siteTitle}
		/>
		<main className="site-main" id="main-content">
			{children}
		</main>
		<Footer
			footerNavigation={footerNavigation}
			footerLegalNavigation={footerLegalNavigation}
			socialLinks={socialLinks}
			copyrightLabel={footerCopyright}
			homeUrl={homeUrl}
			siteTitle={siteTitle}
		/>
	</div>
);
