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

// Same hex values the standard scheme carries in `colors`. They act as
// fallbacks inside `var(...)` so a tile stays visible even when the active
// scheme has not (yet) injected the corresponding `--scheme-*` custom
// property — for example during the brief window between an editor switching
// schemes and the next rebuild, or when a tile references a slot the active
// scheme doesn't define.
const SCHEME_FALLBACKS: Record<ServiceTileColor, string> = {
	c1: "#7bd0e5",
	c2: "#ffa4cc",
	c3: "#ffbb33",
	c4: "#b58ec1",
};

const SCHEME_ON_FALLBACKS: Record<ServiceTileColor, string> = {
	c1: "#22254e",
	c2: "#22254e",
	c3: "#22254e",
	c4: "#ffffff",
};

const getBackgroundValue = (color: ServiceTileColor): string =>
	`var(--scheme-${color}, ${SCHEME_FALLBACKS[color]})`;

const resolveTextColor = (
	background: ServiceTileColor,
	text: ServiceTileTextColor,
): string => {
	if (text === "on") {
		return `var(--scheme-${background}-on, ${SCHEME_ON_FALLBACKS[background]})`;
	}
	if (text === "white") {
		return "#ffffff";
	}
	if (text === "dark") {
		return "#22254e";
	}
	return `var(--scheme-${text}, ${SCHEME_FALLBACKS[text]})`;
};

const getTileStyle = (
	background: ServiceTileColor,
	text: ServiceTileTextColor,
): React.CSSProperties => ({
	background: getBackgroundValue(background),
	color: resolveTextColor(background, text),
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
