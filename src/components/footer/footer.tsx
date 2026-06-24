import * as React from "react";
import type { NormalizedNavigationItem } from "../../lib/navigation";

type FooterProps = {
	footerNavigation?: NormalizedNavigationItem[];
	footerLegalNavigation?: NormalizedNavigationItem[];
	socialLinks?: NormalizedNavigationItem[];
	homeUrl?: string;
	siteTitle?: string;
	copyrightLabel?: string;
};

const FooterNavigation: React.FC<{
	items: NormalizedNavigationItem[];
	label: string;
	modifier?: string;
}> = ({ items, label, modifier }) => {
	if (items.length === 0) {
		return null;
	}

	const listClassName = modifier
		? `site-footer__nav-list site-footer__nav-list--${modifier}`
		: "site-footer__nav-list";

    const renderIcon = (item: NormalizedNavigationItem) => {
        // map common social icons by explicit icon value, label or url
        const key = (item.icon || item.label || "").toLowerCase();
        const url = (item.url || "").toLowerCase();

        const isInstagram = key.includes("instagram") || url.includes("instagram");
        const isFacebook = key.includes("facebook") || key.includes("fb") || url.includes("facebook") || url.includes("fb.");

        if (isInstagram) {
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" opacity="0.0" />
                    <path d="M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6z" fill="currentColor" />
                    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
                </svg>
            );
        }

        if (isFacebook) {
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M15 8h2.5V5.5H15c-1.38 0-2.5 1.12-2.5 2.5V11H10v2h2.5v6h2.5v-6H17l.5-2h-2V8z" fill="currentColor" />
                </svg>
            );
        }

        // fallback: if icon string contains inline content, render it
        return item.icon ? <span aria-hidden="true">{item.icon}</span> : null;
    };

    return (
        <nav className="site-footer__nav" aria-label={label}>
            <ul className={listClassName}>
                {items.map((item) => (
                    <li key={`${item.url}-${item.label}`}>
                        <a
                            href={item.url}
                            aria-label={item.ariaLabel || item.label}
                            target={item.openInNewTab ? "_blank" : undefined}
                            rel={item.openInNewTab ? "noreferrer" : undefined}
                        >
                            {modifier === "social" ? (
                                <span className="site-footer__social-icon">{renderIcon(item)}</span>
                            ) : (
                                renderIcon(item)
                            )}
                            <span className="site-footer__nav-label">{item.label}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export const Footer: React.FC<FooterProps> = ({
	footerNavigation = [],
	footerLegalNavigation = [],
	socialLinks = [],
	homeUrl = "/",
	siteTitle = "RathausGalerien",
	copyrightLabel,
}) => (
	<footer className="site-footer">
		<div className="site-footer__inner">
			<a
				className="site-footer__brand"
				href={homeUrl}
				aria-label={`${siteTitle} Startseite`}
			>
				<img
					src="/media/_rathausgalerien.svg"
					alt=""
					width="210"
					height="100"
				/>
				<span className="visually-hidden">{siteTitle}</span>
			</a>

			<FooterNavigation items={footerNavigation} label="Footer-Navigation" />
			<FooterNavigation
				items={footerLegalNavigation}
				label="Rechtliche Links"
				modifier="legal"
			/>
			<FooterNavigation
				items={socialLinks}
				label="Social Media"
				modifier="social"
			/>

			<p className="site-footer__copyright">
				{copyrightLabel ?? `© ${new Date().getFullYear()} ${siteTitle}`}
			</p>
		</div>
	</footer>
);
