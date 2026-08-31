import * as React from "react";
import { Footer } from "../components/footer/footer";
import { Header } from "../components/header/header";
import { ThemeStyle } from "../components/theme/theme-style";
import type { SiteTheme } from "../lib/content/types";
import type { NormalizedNavigationItem } from "../lib/navigation";

type SiteLayoutProps = {
	children: React.ReactNode;
	theme?: SiteTheme | null;
	mainNavigation?: NormalizedNavigationItem[];
	utilityNavigation?: NormalizedNavigationItem[];
	headerIconNavigation?: NormalizedNavigationItem[];
	footerNavigation?: NormalizedNavigationItem[];
	footerLegalNavigation?: NormalizedNavigationItem[];
	socialLinks?: NormalizedNavigationItem[];
	languages?: { code: string; label: string; url: string }[];
	homeUrl?: string;
	siteTitle?: string;
};

export const SiteLayout: React.FC<SiteLayoutProps> = ({
	children,
	theme,
	mainNavigation = [],
	utilityNavigation = [],
	headerIconNavigation = [],
	footerNavigation = [],
	footerLegalNavigation = [],
	socialLinks = [],
	languages,
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
			headerIconNavigation={headerIconNavigation}
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
			homeUrl={homeUrl}
			siteTitle={siteTitle}
		/>
	</div>
);
