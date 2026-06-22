import * as React from "react";
import type { NormalizedNavigationItem } from "../../lib/navigation";

type HeaderProps = {
	mainNavigation?: NormalizedNavigationItem[];
	utilityNavigation?: NormalizedNavigationItem[];
	headerIconNavigation?: NormalizedNavigationItem[];
	homeUrl?: string;
	siteTitle?: string;
};

type HeaderIconName = "phone" | "location" | "hours" | "default";

const getHeaderIconName = (item: NormalizedNavigationItem): HeaderIconName => {
	const value = `${item.icon ?? ""} ${item.label} ${item.url}`.toLowerCase();

	if (
		value.includes("phone") ||
		value.includes("telefon") ||
		value.includes("tel:")
	) {
		return "phone";
	}

	if (
		value.includes("location") ||
		value.includes("lage") ||
		value.includes("anfahrt") ||
		value.includes("map")
	) {
		return "location";
	}

	if (
		value.includes("hour") ||
		value.includes("zeit") ||
		value.includes("geöffnet") ||
		value.includes("open")
	) {
		return "hours";
	}

	return "default";
};

const HeaderIcon: React.FC<{ name: HeaderIconName }> = ({ name }) => {
	if (name === "phone") {
		return (
			<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
				<path d="M21.5 10.5c2.8-1.7 7.5 6.2 6.9 8.7-.4 1.6-2.9 4.2-4.5 5.6 2.9 5.5 7.5 10.1 13 13 1.4-1.6 4-4.1 5.6-4.5 2.5-.6 10.4 4.1 8.7 6.9-2.1 3.4-6.4 8.6-11.2 8.2-11.2-1-24.5-14.3-25.5-25.5-.5-4.9 3.6-10.3 7-12.4Z" />
			</svg>
		);
	}

	if (name === "location") {
		return (
			<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
				<path d="M32 56s17-17.2 17-31.1C49 15.5 41.4 8 32 8s-17 7.5-17 16.9C15 38.8 32 56 32 56Z" />
				<circle cx="32" cy="24.5" r="6" />
			</svg>
		);
	}

	if (name === "hours") {
		return (
			<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
				<circle cx="32" cy="32" r="22" />
				<path d="M32 17v16l11 6" />
				<path d="M32 10v4M32 50v4M54 32h-4M14 32h-4" />
			</svg>
		);
	}

	return (
		<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
			<circle cx="32" cy="32" r="22" />
		</svg>
	);
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

const renderIconNavigationItems = (items: NormalizedNavigationItem[]) =>
	items.map((item) => (
		<li key={`${item.url}-${item.label}`}>
			<a
				className="site-header__icon-link"
				href={item.url}
				aria-label={item.ariaLabel ?? item.label}
				title={item.label}
				target={item.openInNewTab ? "_blank" : undefined}
				rel={item.openInNewTab ? "noreferrer" : undefined}
			>
				<HeaderIcon name={getHeaderIconName(item)} />
				<span className="visually-hidden">{item.label}</span>
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

const IconNavigation: React.FC<{
	items: NormalizedNavigationItem[];
	label: string;
}> = ({ items, label }) => {
	if (items.length === 0) {
		return null;
	}

	return (
		<nav className="site-header__icon-nav" aria-label={label}>
			<ul className="site-header__icon-list">
				{renderIconNavigationItems(items)}
			</ul>
		</nav>
	);
};

const combineNavigation = (
	...navigationGroups: NormalizedNavigationItem[][]
): NormalizedNavigationItem[] => navigationGroups.flat();

const toIconNavigation = (
	mainNavigation: NormalizedNavigationItem[],
	utilityNavigation: NormalizedNavigationItem[],
	headerIconNavigation: NormalizedNavigationItem[],
): NormalizedNavigationItem[] => {
	if (headerIconNavigation.length > 0) {
		return headerIconNavigation;
	}

	const derivedItems = combineNavigation(
		utilityNavigation,
		mainNavigation,
	).filter((item) => getHeaderIconName(item) !== "default");

	return derivedItems;
};

export const Header: React.FC<HeaderProps> = ({
	mainNavigation = [],
	utilityNavigation = [],
	headerIconNavigation = [],
	homeUrl = "/",
	siteTitle = "RathausGalerien",
}) => {
	const [isScrolled, setIsScrolled] = React.useState(false);
	const mobileNavigation = combineNavigation(
		mainNavigation,
		utilityNavigation,
		headerIconNavigation,
	);
	const iconNavigation = toIconNavigation(
		mainNavigation,
		utilityNavigation,
		headerIconNavigation,
	);

	React.useEffect(() => {
		const updateHeaderState = () => {
			setIsScrolled(window.scrollY > 24);
		};

		updateHeaderState();
		window.addEventListener("scroll", updateHeaderState, { passive: true });

		return () => window.removeEventListener("scroll", updateHeaderState);
	}, []);

	return (
		<header
			className={`site-header${isScrolled ? " site-header--scrolled" : ""}`}
		>
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

				<div className="site-header__actions">
					<IconNavigation
						items={iconNavigation.slice(0, 3)}
						label="Schnellzugriffe"
					/>

					{mobileNavigation.length > 0 ? (
						<details className="site-header__menu">
							<summary
								className="site-header__menu-summary"
								aria-label="Menü öffnen"
							>
								<span aria-hidden="true" className="site-header__menu-lines">
									<span />
									<span />
									<span />
								</span>
								<span className="visually-hidden">Menü</span>
							</summary>
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

				<NavigationList
					items={mainNavigation}
					label="Hauptnavigation"
					className="site-header__desktop-nav"
				/>
			</div>
		</header>
	);
};
