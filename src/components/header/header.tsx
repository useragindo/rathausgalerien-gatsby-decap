import * as React from "react";
import type { NormalizedNavigationItem } from "../../lib/navigation";

type HeaderProps = {
	mainNavigation?: NormalizedNavigationItem[];
	utilityNavigation?: NormalizedNavigationItem[];
	headerIconNavigation?: NormalizedNavigationItem[];
	socialLinks?: NormalizedNavigationItem[];
	languages?: { code: string; label: string; url: string }[];
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

const getHeaderIconLabel = (item: NormalizedNavigationItem): string => {
	const iconName = getHeaderIconName(item);

	if (iconName === "phone") {
		return "Kontakt";
	}

	if (iconName === "location") {
		return "Anfahrt";
	}

	if (iconName === "hours") {
		return "Geöffnet";
	}

	return item.label;
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

const getAlternateLanguageUrl = (
	currentPath: string,
	languages: { code: string; label: string; url: string }[],
): { code: string; label: string; url: string }[] => {
	const normalizedPath = currentPath.replace(/\/$/, "") || "/";

	return languages.map((language) => {
		if (language.code === "en") {
			const englishPath =
				normalizedPath === "/" ? "/en/" : `/en${normalizedPath}/`;
			return { ...language, url: englishPath };
		}

		if (language.code === "de") {
			const germanPath =
				normalizedPath === "/en" || normalizedPath === "/en/"
					? "/"
					: normalizedPath.replace(/^\/en/, "") || "/";
			return { ...language, url: germanPath };
		}

		return language;
	});
};

const LanguageSwitcher: React.FC<{
	languages: { code: string; label: string; url: string }[];
	modifier?: string;
}> = ({ languages, modifier }) => {
	const [hrefMap, setHrefMap] = React.useState<Record<string, string>>(() =>
		Object.fromEntries(languages.map((language) => [language.code, language.url])),
	);

	React.useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const updated = getAlternateLanguageUrl(window.location.pathname, languages);
		setHrefMap(Object.fromEntries(updated.map((language) => [language.code, language.url])));
	}, [languages]);

	const className = modifier
		? `site-header__language site-header__language--${modifier}`
		: "site-header__language";

	return (
		<nav className={className} aria-label="Sprachwechsel">
			<ul className="site-header__language-list">
				{languages.map((language, index) => (
					<li key={language.code}>
						<a
							className="site-header__language-link"
							href={hrefMap[language.code] ?? language.url}
							aria-label={`Sprache ${language.code}`}
						>
							{language.label}
						</a>
						{index < languages.length - 1 ? (
							<span className="site-header__language-separator" aria-hidden="true">
								/
							</span>
						) : null}
					</li>
				))}
			</ul>
		</nav>
	);
};

const SocialIcon: React.FC<{ label: string }> = ({ label }) => {
	const key = label.toLowerCase();
	const isInstagram = key.includes("instagram");
	const isFacebook = key.includes("facebook") || key.includes("fb");

	if (isInstagram) {
		return (
			<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" opacity="0" />
				<path d="M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6z" fill="currentColor" />
				<circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
			</svg>
		);
	}

	if (isFacebook) {
		return (
			<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<path d="M15 8h2.5V5.5H15c-1.38 0-2.5 1.12-2.5 2.5V11H10v2h2.5v6h2.5v-6H17l.5-2h-2V8z" fill="currentColor" />
			</svg>
		);
	}

	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
			<circle cx="12" cy="12" r="9" fill="currentColor" />
		</svg>
	);
};

const MenuTeaserCards: React.FC = () => (
	<div className="site-header__menu-teasers">
		<div className="site-header__menu-teaser site-header__menu-teaser--blue">
			<div className="site-header__menu-teaser-g">G</div>
			<p className="site-header__menu-teaser-title">Das neue Galerien Magazin!</p>
			<p className="site-header__menu-teaser-sub">Gleich reinschauen</p>
		</div>
		<div className="site-header__menu-teaser site-header__menu-teaser--image">
			<div className="site-header__menu-teaser-placeholder" aria-hidden="true" />
		</div>
	</div>
);

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
				<span className="visually-hidden">{getHeaderIconLabel(item)}</span>
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

const renderSocialItems = (items: NormalizedNavigationItem[]) =>
	items.map((item) => (
		<li key={`${item.url}-${item.label}`}>
			<a
				className="site-header__social-link"
				href={item.url}
				aria-label={item.ariaLabel || item.label}
				target={item.openInNewTab ? "_blank" : undefined}
				rel={item.openInNewTab ? "noreferrer" : undefined}
			>
				<SocialIcon label={item.label} />
				<span className="visually-hidden">{item.label}</span>
			</a>
		</li>
	));

export const Header: React.FC<HeaderProps> = ({
	mainNavigation = [],
	utilityNavigation = [],
	headerIconNavigation = [],
	socialLinks = [],
	languages = [
		{ code: "de", label: "DE", url: "/" },
		{ code: "en", label: "EN", url: "/en/" },
	],
	homeUrl = "/",
	siteTitle = "RathausGalerien",
}) => {
	const [isScrolled, setIsScrolled] = React.useState(false);
	const iconNavigation = toIconNavigation(
		mainNavigation,
		utilityNavigation,
		headerIconNavigation,
	);
	const menuNavigation = combineNavigation(mainNavigation, utilityNavigation);

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
				<div className="site-header__brand-group">
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

					<LanguageSwitcher languages={languages} />
				</div>

				<div className="site-header__actions">
					<IconNavigation
						items={iconNavigation.slice(0, 3)}
						label="Schnellzugriffe"
					/>

					{menuNavigation.length > 0 ? (
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
							<div className="site-header__overlay">
								<div className="site-header__overlay-grid">
									<nav aria-label="Hauptnavigation">
										<ul className="site-header__nav-list site-header__nav-list--overlay">
											{renderNavigationItems(menuNavigation)}
										</ul>
										</nav>

									<MenuTeaserCards />
								</div>

								<div className="site-header__overlay-footer">
									{socialLinks.length > 0 ? (
										<nav
											className="site-header__social-nav"
											aria-label="Social Media"
										>
											<ul className="site-header__social-list">
												{renderSocialItems(socialLinks)}
											</ul>
										</nav>
									) : null}

								<LanguageSwitcher languages={languages} modifier="overlay" />
								</div>
							</div>
						</details>
					) : null}
				</div>
			</div>
		</header>
	);
};
