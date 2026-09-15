import * as React from "react";
import { createPortal } from "react-dom";
import { TileGrid } from "../content-blocks/content-block-renderer";
import type {
	ImportedContentTile,
	LanguageCode,
	SiteTheme,
} from "../../lib/content/types";
import type { MenuIcon, NormalizedNavigationItem } from "../../lib/navigation";

type HeaderProps = {
	mainNavigation?: NormalizedNavigationItem[];
	utilityNavigation?: NormalizedNavigationItem[];
	// Maintained in the CMS under Einstellungen → Menü. Both the header and the
	// open menu draw the same three icons.
	menuIcons?: MenuIcon[];
	// The boxes in the open menu — ordinary content tiles (Einstellungen → Menü).
	menuBoxes?: ImportedContentTile[];
	// Separate from footer social links: maintained in Einstellungen → Menü.
	menuSocialLinks?: NormalizedNavigationItem[];
	socialLinks?: NormalizedNavigationItem[];
	languages?: { code: string; label: string; url: string }[];
	language?: LanguageCode;
	theme?: SiteTheme | null;
	homeUrl?: string;
	siteTitle?: string;
};

type HeaderIconName = MenuIcon["symbol"];

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

const SocialIcon: React.FC<{ label: string; icon?: string }> = ({ label, icon }) => {
	if (icon) {
		// Masked span, not an img: the uploaded SVGs ship with a hardcoded
		// light fill, so the mask lets the icon take the scheme's text colour
		// like every other header icon (see .site-header__icon-glyph).
		return (
			<span
				className="site-header__icon-glyph"
				style={{
					WebkitMaskImage: `url("${icon}")`,
					maskImage: `url("${icon}")`,
				}}
				aria-hidden="true"
			/>
		);
	}

	const key = label.toLowerCase();
	if (key.includes("instagram")) {
		return (
			<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm10.5 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
			</svg>
		);
	}
	if (key.includes("facebook") || key.includes("fb")) {
		return (
			<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<path fill="currentColor" d="M13.8 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.7-1.6H17V4.8c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.7V11H9v3h2.4v8h2.4Z" />
			</svg>
		);
	}
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
			<circle cx="12" cy="12" r="9" fill="currentColor" />
		</svg>
	);
};

// The two boxes on the right of the open menu. They are the same tiles the
// content blocks render (a tile with text becomes a colour box, one with an
// image a picture box), capped at the two the design shows.
const MenuTeaserCards: React.FC<{
	boxes: ImportedContentTile[];
	language: LanguageCode;
	theme?: SiteTheme | null;
}> = ({ boxes, language, theme }) => {
	if (!boxes.length) {
		return null;
	}

	return (
		<div className="site-header__menu-teasers">
			<TileGrid
				tiles={boxes}
				categories={null}
				language={language}
				maxTiles={2}
				theme={theme}
			/>
		</div>
	);
};

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

const renderIconItems = (items: MenuIcon[]) =>
	items.map((item, index) => (
		<li key={`${item.symbol}-${item.url}-${index}`}>
			<a
				className="site-header__icon-link"
				href={item.url}
				aria-label={item.label}
				title={item.label}
				target={item.openInNewTab ? "_blank" : undefined}
				rel={item.openInNewTab ? "noreferrer" : undefined}
			>
				{item.image ? (
					// Masked span, not an img: the icon is painted in the scheme's
					// text colour, exactly like the logo (see .site-header__logo).
					<span
						className="site-header__icon-glyph"
						style={{
							WebkitMaskImage: `url("${item.image}")`,
							maskImage: `url("${item.image}")`,
						}}
						aria-hidden="true"
					/>
				) : (
					<HeaderIcon name={item.symbol} />
				)}
				<span className="visually-hidden">{item.label}</span>
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
				<SocialIcon label={item.label} icon={item.icon} />
				<span className="visually-hidden">{item.label}</span>
			</a>
		</li>
	));

/* ─── Menu Overlay ────────────────────────────────────────────────── */
const MenuOverlay: React.FC<{
	isOpen: boolean;
	onClose: () => void;
	menuNavigation: NormalizedNavigationItem[];
	iconNavigation: MenuIcon[];
	menuBoxes: ImportedContentTile[];
	socialLinks: NormalizedNavigationItem[];
	languages: { code: string; label: string; url: string }[];
	language: LanguageCode;
	theme?: SiteTheme | null;
	menuButtonRef: React.RefObject<HTMLButtonElement | null>;
}> = ({
	isOpen,
	onClose,
	menuNavigation,
	iconNavigation,
	menuBoxes,
	socialLinks,
	languages,
	language,
	theme,
	menuButtonRef,
}) => {
	const [mounted, setMounted] = React.useState(false);
	const dialogRef = React.useRef<HTMLDivElement>(null);
	const closeButtonRef = React.useRef<HTMLButtonElement>(null);

	React.useEffect(() => { setMounted(true); }, []);

	React.useEffect(() => {
		document.body.style.overflow = isOpen ? "hidden" : "";
		return () => { document.body.style.overflow = ""; };
	}, [isOpen]);

	React.useEffect(() => {
		if (!isOpen) return;
		const handler = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
				return;
			}

			if (event.key !== "Tab") return;

			const focusable = Array.from(
				dialogRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? [],
			).filter((element) => !element.hasAttribute("hidden"));
			const first = focusable[0];
			const last = focusable.at(-1);

			if (!first || !last) return;
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [isOpen, onClose]);

	React.useEffect(() => {
		if (!isOpen) return;
		const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

		return () => {
			window.cancelAnimationFrame(frame);
			menuButtonRef.current?.focus();
		};
	}, [isOpen, menuButtonRef]);

	if (!mounted || !isOpen) return null;

	const overlay = (
		<div ref={dialogRef} className="site-header__overlay" role="dialog" aria-modal="true" aria-label="Navigation">
			
			{/* Icons + Close — mirrors header-actions position */}
			<div className="site-header__overlay-actions-outer">
				<div className="site-header__overlay-actions">
					{iconNavigation.length > 0 && (
						<nav aria-label="Schnellzugriffe">
							<ul className="site-header__icon-list">
								{renderIconItems(iconNavigation)}
							</ul>
						</nav>
					)}
					<button
						ref={closeButtonRef}
						className="site-header__overlay-close"
						onClick={onClose}
						aria-label="Menü schließen"
						type="button"
					>
						{/* The X fills its viewBox, so its ink is exactly the button size
								(45px in the design) and the stroke stays 1.5px. */}
						<svg viewBox="0 0 45 45" aria-hidden="true" focusable="false">
							<path d="M0.75 0.75 L44.25 44.25 M44.25 0.75 L0.75 44.25" />
						</svg>
						<span className="visually-hidden">Schließen</span>
					</button>
				</div>
			</div>
			{/* Nav + Teasers */}
			<div className="site-header__overlay-body">
				<nav aria-label="Hauptnavigation">
					<ul className="site-header__nav-list site-header__nav-list--overlay">
						{renderNavItems(menuNavigation)}
					</ul>
					{/* Footer: Social */}
					{socialLinks.length > 0 && (
						<nav aria-label="Social Media">
							<ul className="site-header__social-list">
								{renderSocialItems(socialLinks)}
							</ul>
						</nav>
					)}
				</nav>

				<MenuTeaserCards boxes={menuBoxes} language={language} theme={theme} />
			</div>

		</div>
	);

	return createPortal(overlay, document.body);
};

/* ─── Header ──────────────────────────────────────────────────────── */
const combineNavigation = (...groups: NormalizedNavigationItem[][]): NormalizedNavigationItem[] => groups.flat();

export const Header: React.FC<HeaderProps> = ({
	mainNavigation = [],
	utilityNavigation = [],
	menuIcons = [],
	menuBoxes = [],
	menuSocialLinks = [],
	socialLinks = [],
	languages = [
		{ code: "de", label: "DE", url: "/" },
		{ code: "en", label: "EN", url: "/en/" },
	],
	language = "de",
	theme,
	homeUrl = "/",
	siteTitle = "RathausGalerien",
}) => {
	const [isScrolled, setIsScrolled] = React.useState(false);
	const [menuOpen, setMenuOpen] = React.useState(false);
	const menuButtonRef = React.useRef<HTMLButtonElement>(null);

	// The CMS caps the list at 3; slicing keeps a hand-edited file from
	// stretching the header.
	const iconNavigation = menuIcons.slice(0, 3);
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
						{/* Masked span, not an img: the logo is painted in the scheme's
						    text colour (see .site-header__logo). */}
						<span className="site-header__logo" aria-hidden="true" />
						<span className="visually-hidden">{siteTitle}</span>
					</a>

					{/* Language switcher + Icons + Burger */}
					<div className="site-header__actions">
						<LanguageSwitcher languages={languages} modifier="actions" />

						{iconNavigation.length > 0 && (
							<nav className="site-header__icon-nav" aria-label="Schnellzugriffe">
								<ul className="site-header__icon-list">
									{renderIconItems(iconNavigation)}
								</ul>
							</nav>
						)}

						{menuNavigation.length > 0 && (
							<button
								ref={menuButtonRef}
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
				menuBoxes={menuBoxes}
				language={language}
				theme={theme}
				socialLinks={menuSocialLinks}
				languages={languages}
				menuButtonRef={menuButtonRef}
			/>
		</>
	);
};
