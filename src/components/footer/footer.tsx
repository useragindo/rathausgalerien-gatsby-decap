import * as React from "react";
import type { NormalizedNavigationItem } from "../../lib/navigation";

type FooterProps = {
	footerNavigation?: NormalizedNavigationItem[];
	footerLegalNavigation?: NormalizedNavigationItem[];
	socialLinks?: NormalizedNavigationItem[];
	siteTitle?: string;
	copyrightLabel?: string;
};

const FooterNavigation: React.FC<{
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

export const Footer: React.FC<FooterProps> = ({
	footerNavigation = [],
	footerLegalNavigation = [],
	socialLinks = [],
	siteTitle = "RathausGalerien",
	copyrightLabel,
}) => (
	<footer>
		<FooterNavigation items={footerNavigation} label="Footer-Navigation" />
		<FooterNavigation items={footerLegalNavigation} label="Rechtliche Links" />
		<FooterNavigation items={socialLinks} label="Social Media" />
		<p>{copyrightLabel ?? `© ${new Date().getFullYear()} ${siteTitle}`}</p>
	</footer>
);
