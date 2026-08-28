import * as React from "react";
import { createPortal } from "react-dom";
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
	if (value.includes("phone") || value.includes("telefon") || value.includes("tel:")) return "phone";
	if (value.includes("location") || value.includes("lage") || value.includes("anfahrt") || value.includes("map")) return "location";
	if (value.includes("hour") || value.includes("zeit") || value.includes("geöffnet") || value.includes("open")) return "hours";
	return "default";
};

const getHeaderIconLabel = (item: NormalizedNavigationItem): string => {
	const n = getHeaderIconName(item);
	if (n === "phone") return "Kontakt";
	if (n === "location") return "Anfahrt";
	if (n === "hours") return "Öffnungszeiten";
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
			</svg>
		);
	}
	return (
		<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
			<circle cx="32" cy="32" r="22" />
		</svg>
	);
};

const LanguageSwitcher: React.FC<{
	languages: { code: string; label: string; url: string }[];
	modifier?: string;
}> = ({ languages, modifier }) => {
	// URLs are resolved per page at build time (see gatsby-node `languageLinks`),
	// so each link points at the correct translation of the current page.
	const className = modifier
		? `site-header__language site-header__language--${modifier}`
		: "site-header__language";

	return (
		<nav className={className} aria-label="Sprachwechsel">
			<ul className="site-header__language-list">
				{languages.map((lang, i) => (
					<li key={lang.code}>
						<a className="site-header__language-link" href={lang.url} aria-label={`Sprache ${lang.code}`}>
							{lang.label}
						</a>
						{i < languages.length - 1 && (
							<span className="site-header__language-separator" aria-hidden="true"> / </span>
						)}
					</li>
				))}
			</ul>
		</nav>
	);
};

const SocialIcon: React.FC<{ label: string }> = ({ label }) => {
	const key = label.toLowerCase();
	if (key.includes("instagram")) {
		return (
			<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
				<circle cx="12" cy="12" r="5" />
				<circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
			</svg>
		);
	}
	if (key.includes("facebook") || key.includes("fb")) {
		return (
			<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
			</svg>
		);
	}
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.5">
			<circle cx="12" cy="12" r="9" />
		</svg>
	);
};

const MenuTeaserCards: React.FC = () => (
	<div className="site-header__menu-teasers">
		<div className="site-header__menu-teaser site-header__menu-teaser--blue">
			<div className="site-header__menu-teaser-g" aria-hidden="true">G</div>
			<p className="site-header__menu-teaser-title">Das neue Galerien Magazin!</p>
			<p className="site-header__menu-teaser-sub">Gleich reinschauen</p>
		</div>
		<div className="site-header__menu-teaser site-header__menu-teaser--image">
			<div className="site-header__menu-teaser-placeholder" aria-hidden="true" />
		</div>
	</div>
);

const renderNavItems = (items: NormalizedNavigationItem[]) =>
	items.map((item) => (
		<li key={`${item.url}-${item.label}`}>
			<a
				className="site-header__nav-link"
				href={item.url}
				aria-label={item.ariaLabel}
				target={item.openInNewTab ? "_blank" : undefined}
				rel={item.openInNewTab ? "noreferrer" : undefined}
			>
				<span>{item.label}</span>
			</a>
		</li>
	));

const renderIconItems = (items: NormalizedNavigationItem[]) =>
	items.map((item) => (
		<li key={`${item.url}-${item.label}`}>
			<a
				className="site-header__icon-link"
				href={item.url}
				aria-label={item.ariaLabel ?? getHeaderIconLabel(item)}
				title={getHeaderIconLabel(item)}
				target={item.openInNewTab ? "_blank" : undefined}
				rel={item.openInNewTab ? "noreferrer" : undefined}
			>
				<HeaderIcon name={getHeaderIconName(item)} />
				<span className="visually-hidden">{getHeaderIconLabel(item)}</span>
			</a>
		</li>
	));

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

/* ─── Menu Overlay ────────────────────────────────────────────────── */
const MenuOverlay: React.FC<{
	isOpen: boolean;
	onClose: () => void;
	menuNavigation: NormalizedNavigationItem[];
	iconNavigation: NormalizedNavigationItem[];
	socialLinks: NormalizedNavigationItem[];
	languages: { code: string; label: string; url: string }[];
}> = ({ isOpen, onClose, menuNavigation, iconNavigation, socialLinks, languages }) => {
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => { setMounted(true); }, []);

	React.useEffect(() => {
		document.body.style.overflow = isOpen ? "hidden" : "";
		return () => { document.body.style.overflow = ""; };
	}, [isOpen]);

	React.useEffect(() => {
		if (!isOpen) return;
		const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [isOpen, onClose]);

	if (!mounted || !isOpen) return null;

	const overlay = (
		<div className="site-header__overlay" role="dialog" aria-modal="true" aria-label="Navigation">

			{/* Icons + Close — mirrors header-actions position */}
			<div className="site-header__overlay-actions">
				{iconNavigation.length > 0 && (
					<nav aria-label="Schnellzugriffe">
						<ul className="site-header__icon-list">
							{renderIconItems(iconNavigation.slice(0, 3))}
						</ul>
					</nav>
				)}
				<button
					className="site-header__overlay-close"
					onClick={onClose}
					aria-label="Menü schließen"
					type="button"
				>
					<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
						<path d="M14 14 L50 50 M50 14 L14 50" />
					</svg>
					<span className="visually-hidden">Schließen</span>
				</button>
			</div>

			{/* Nav + Teasers */}
			<div className="site-header__overlay-body">
				<nav aria-label="Hauptnavigation">
					<ul className="site-header__nav-list site-header__nav-list--overlay">
						{renderNavItems(menuNavigation)}
					</ul>
				</nav>

				<MenuTeaserCards />
			</div>

			{/* Footer: Language + Social */}
			<div className="site-header__overlay-footer">
				<LanguageSwitcher languages={languages} modifier="overlay" />

				{socialLinks.length > 0 && (
					<nav aria-label="Social Media">
						<ul className="site-header__social-list">
							{renderSocialItems(socialLinks)}
						</ul>
					</nav>
				)}
			</div>

		</div>
	);

	return createPortal(overlay, document.body);
};

/* ─── Header ──────────────────────────────────────────────────────── */
const combineNavigation = (...groups: NormalizedNavigationItem[][]): NormalizedNavigationItem[] => groups.flat();

const toIconNavigation = (
	main: NormalizedNavigationItem[],
	utility: NormalizedNavigationItem[],
	explicit: NormalizedNavigationItem[],
): NormalizedNavigationItem[] => {
	if (explicit.length > 0) return explicit;
	return combineNavigation(utility, main).filter((item) => getHeaderIconName(item) !== "default");
};

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
	const [menuOpen, setMenuOpen] = React.useState(false);

	const iconNavigation = toIconNavigation(mainNavigation, utilityNavigation, headerIconNavigation);
	const menuNavigation = combineNavigation(mainNavigation, utilityNavigation);

	const openMenu = React.useCallback(() => setMenuOpen(true), []);
	const closeMenu = React.useCallback(() => setMenuOpen(false), []);

	React.useEffect(() => {
		const update = () => setIsScrolled(window.scrollY > 0);
		update();
		window.addEventListener("scroll", update, { passive: true });
		return () => window.removeEventListener("scroll", update);
	}, []);

	return (
		<>
			<header className={`site-header${isScrolled ? " site-header--scrolled" : ""}`}>
				<div className="site-header__inner">

					{/* Logo */}
					<a className="site-header__brand" href={homeUrl} aria-label={`${siteTitle} Startseite`}>
						<img
							className="site-header__logo"
							src="/media/locations/_rathausgalerien.svg"
							alt=""
							width="400"
							height="109"
						/>
						<span className="visually-hidden">{siteTitle}</span>
					</a>

					{/* Language switcher + Icons + Burger */}
					<div className="site-header__actions">
						<LanguageSwitcher languages={languages} modifier="actions" />

						{iconNavigation.length > 0 && (
							<nav className="site-header__icon-nav" aria-label="Schnellzugriffe">
								<ul className="site-header__icon-list">
									{renderIconItems(iconNavigation.slice(0, 3))}
								</ul>
							</nav>
						)}

						{menuNavigation.length > 0 && (
							<button
								className="site-header__menu-btn"
								onClick={openMenu}
								aria-label="Menü öffnen"
								aria-expanded={menuOpen}
								type="button"
							>
								<span aria-hidden="true" className="site-header__menu-lines">
									<span />
									<span />
									<span />
								</span>
								<span className="visually-hidden">Menü</span>
							</button>
						)}
					</div>

				</div>
			</header>

			<MenuOverlay
				isOpen={menuOpen}
				onClose={closeMenu}
				menuNavigation={menuNavigation}
				iconNavigation={iconNavigation}
				socialLinks={socialLinks}
				languages={languages}
			/>
		</>
	);
};
