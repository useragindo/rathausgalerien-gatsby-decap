import * as React from "react";
import type { NormalizedNavigationItem } from "../../lib/navigation";

type HeaderProps = {
	mainNavigation?: NormalizedNavigationItem[];
	utilityNavigation?: NormalizedNavigationItem[];
	headerIconNavigation?: NormalizedNavigationItem[];
	homeUrl?: string;
	siteTitle?: string;
};

const NavigationList: React.FC<{
	items: NormalizedNavigationItem[];
	label: string;
}> = ({ items, label }) => {
	if (items.length === 0) {
		return null;
	}

	return (
		<nav aria-label={label}>
			<ul>
				{items.map((item) => (
					<li key={`${item.url}-${item.label}`}>
						<a
							href={item.url}
							aria-label={item.ariaLabel}
							target={item.openInNewTab ? "_blank" : undefined}
							rel={item.openInNewTab ? "noreferrer" : undefined}
						>
							{item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
							<span>{item.label}</span>
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
};

export const Header: React.FC<HeaderProps> = ({
	mainNavigation = [],
	utilityNavigation = [],
	headerIconNavigation = [],
	homeUrl = "/",
	siteTitle = "RathausGalerien",
}) => (
	<header>
		<a href={homeUrl} aria-label={`${siteTitle} Startseite`}>
			{siteTitle}
		</a>
		<NavigationList items={mainNavigation} label="Hauptnavigation" />
		<NavigationList items={utilityNavigation} label="Servicenavigation" />
		<NavigationList items={headerIconNavigation} label="Schnellzugriffe" />
	</header>
);
