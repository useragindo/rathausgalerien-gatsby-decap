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
        // simple mapping for common social icons; prefer explicit icon string
        const key = (item.icon || item.label || "").toLowerCase();

        if (key.includes("instagram")) {
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M7 12a5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5z" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
            );
        }

        if (key.includes("facebook") || key.includes("fb")) {
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M15 8h2.5V5.5H15c-1.38 0-2.5 1.12-2.5 2.5V11H10v2h2.5v6h2.5v-6H17l.5-2h-2V8z" fill="currentColor" />
                </svg>
            );
        }

        // fallback: if icon string contains inline SVG/emoji or similar, render it
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
