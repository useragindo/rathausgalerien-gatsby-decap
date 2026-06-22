import * as React from "react";
import type { NormalizedNavigationItem } from "../../lib/navigation";

type HeaderProps = {
	mainNavigation?: NormalizedNavigationItem[];
	utilityNavigation?: NormalizedNavigationItem[];
	headerIconNavigation?: NormalizedNavigationItem[];
	homeUrl?: string;
	siteTitle?: string;
};

const renderNavigationItems = (items: NormalizedNavigationItem[]) =>
	items.map((item) => (
		<li key={`${item.url}-${item.label}`}>
			<a
				className="site-header__nav-link"
				href={item.url}
				aria-label={item.ariaLabel}
				target={item.openInNewTab ? "_blank" : undefined}
				rel={item.openInNewTab ? "noreferrer" : undefined}
			>
				{item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
				<span>{item.label}</span>
			</a>
		</li>
	));

const NavigationList: React.FC<{
	items: NormalizedNavigationItem[];
	label: string;
	className?: string;
}> = ({ items, label, className = "site-header__nav" }) => {
	if (items.length === 0) {
		return null;
	}

	return (
		<nav className={className} aria-label={label}>
			<ul className="site-header__nav-list">{renderNavigationItems(items)}</ul>
		</nav>
	);
};

const combineNavigation = (
	...navigationGroups: NormalizedNavigationItem[][]
): NormalizedNavigationItem[] => navigationGroups.flat();

export const Header: React.FC<HeaderProps> = ({
	mainNavigation = [],
	utilityNavigation = [],
	headerIconNavigation = [],
	homeUrl = "/",
	siteTitle = "RathausGalerien",
}) => {
	const mobileNavigation = combineNavigation(
		mainNavigation,
		utilityNavigation,
		headerIconNavigation,
	);

	return (
		<header className="site-header">
			<div className="site-header__inner">
				<a
					className="site-header__brand"
					href={homeUrl}
					aria-label={`${siteTitle} Startseite`}
				>
					<img
						className="site-header__logo"
						src="/media/_rathausgalerien.svg"
						alt=""
						width="210"
						height="100"
					/>
					<span className="visually-hidden">{siteTitle}</span>
				</a>

				<NavigationList items={mainNavigation} label="Hauptnavigation" />

				<div className="site-header__actions">
					<NavigationList
						items={utilityNavigation}
						label="Servicenavigation"
						className="site-header__utility-nav"
					/>
					<NavigationList
						items={headerIconNavigation}
						label="Schnellzugriffe"
						className="site-header__icon-nav"
					/>
				</div>

				{mobileNavigation.length > 0 ? (
					<details className="site-header__menu">
						<summary className="site-header__menu-summary">Menü</summary>
						<div className="site-header__mobile-panel">
							<nav aria-label="Mobile Navigation">
								<ul className="site-header__nav-list site-header__nav-list--mobile">
									{renderNavigationItems(mobileNavigation)}
								</ul>
							</nav>
						</div>
					</details>
				) : null}
			</div>
		</header>
	);
};
