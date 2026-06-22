import * as React from "react";
import { Footer } from "../components/footer/footer";
import { Header } from "../components/header/header";
import type { NormalizedNavigationItem } from "../lib/navigation";

type SiteLayoutProps = {
	children: React.ReactNode;
	mainNavigation?: NormalizedNavigationItem[];
	utilityNavigation?: NormalizedNavigationItem[];
	headerIconNavigation?: NormalizedNavigationItem[];
	footerNavigation?: NormalizedNavigationItem[];
	footerLegalNavigation?: NormalizedNavigationItem[];
	socialLinks?: NormalizedNavigationItem[];
	homeUrl?: string;
	siteTitle?: string;
};

export const SiteLayout: React.FC<SiteLayoutProps> = ({
	children,
	mainNavigation = [],
	utilityNavigation = [],
	headerIconNavigation = [],
	footerNavigation = [],
	footerLegalNavigation = [],
	socialLinks = [],
	homeUrl = "/",
	siteTitle = "RathausGalerien",
}) => (
	<div className="site-shell">
		<a className="skip-link" href="#main-content">
			Zum Inhalt springen
		</a>
		<Header
			mainNavigation={mainNavigation}
			utilityNavigation={utilityNavigation}
			headerIconNavigation={headerIconNavigation}
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
