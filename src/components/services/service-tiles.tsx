import * as React from "react";
import type {
	LanguageCode,
	NormalizedService,
	ServiceTileColor,
	ServiceTileTextColor,
} from "../../lib/content/types";

type ServiceTilesProps = {
	services: NormalizedService[];
	language: LanguageCode;
};

// Hex fallbacks mirror the standard scheme in content/color-schemes/standard.md.
// They live inside `var(...)` so a tile stays visible even when the active
// scheme has not (yet) injected the corresponding `--scheme-*` custom
// property — for example during the brief window between an editor switching
// schemes and the next rebuild, or when a tile references a slot the active
// scheme does not define.
const SCHEME_FALLBACKS: Record<ServiceTileColor, string> = {
	bg: "#d1efff",
	text: "#22254e",
	c1: "#7bd0e5",
	c2: "#ffa4cc",
	c3: "#ffbb33",
	c4: "#b58ec1",
};

const getColorValue = (slot: ServiceTileColor | ServiceTileTextColor): string =>
	`var(--scheme-${slot}, ${SCHEME_FALLBACKS[slot]})`;

const getTileStyle = (
	background: ServiceTileColor,
	text: ServiceTileTextColor,
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
