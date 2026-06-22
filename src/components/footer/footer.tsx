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

	return (
		<nav className="site-footer__nav" aria-label={label}>
			<ul className={listClassName}>
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
