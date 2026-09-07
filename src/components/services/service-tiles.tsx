import * as React from "react";
import type {
	ColorToken,
	LanguageCode,
	NormalizedService,
} from "../../lib/content/types";

type ServiceTilesProps = {
	services: NormalizedService[];
	language: LanguageCode;
};

// Schwarz/Weiß are fixed neutrals, not scheme slots (see color-tokens.ts) —
// everything else is a `var(--scheme-<slot>)` that changes with the active
// colour scheme.
const NEUTRAL_VAR_BY_TOKEN: Partial<Record<ColorToken, string>> = {
	schwarz: "var(--color-black)",
	weiss: "var(--color-white)",
};

const getColorValue = (slot: ColorToken): string =>
	NEUTRAL_VAR_BY_TOKEN[slot] ?? `var(--scheme-${slot})`;

const getTileStyle = (
	background: ColorToken,
	text: ColorToken,
): React.CSSProperties => ({
	background: getColorValue(background),
	color: getColorValue(text),
});

// Unlike the generic grid-4 content block (capped at 4 tiles by design), this
// grid shows every service the editor flagged for it, wrapping into as many
// rows of 4 as needed.
export const ServiceTiles: React.FC<ServiceTilesProps> = ({
	services,
	language,
}) => {
	const items = services
		.filter((service) => service.language === language && service.tile)
		.slice()
		.sort((a, b) => a.name.localeCompare(b.name, language));

	if (!items.length) {
		return null;
	}

	return (
		// "Services" is the same word in German and English on this site (the
		// page itself titles both language versions this way), so the label
		// below is intentionally not branched on `language`.
		<section className="service-tiles" aria-label="Services">
			<ul className="service-tiles__grid">
				{items.map((service) => (
					<li
						className="service-tile"
						key={service.id}
						style={getTileStyle(service.tileColor, service.tileTextColor)}
					>
						{service.icon ? (
							<img
								className="service-tile__icon"
								src={service.icon}
								alt=""
								loading="lazy"
							/>
						) : null}
						<span className="service-tile__label">{service.name}</span>
					</li>
				))}
			</ul>
		</section>
	);
};
