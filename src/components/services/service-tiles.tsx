import * as React from "react";
import type {
	LanguageCode,
	NormalizedService,
	ServiceTileColor,
} from "../../lib/content/types";

type ServiceTilesProps = {
	services: NormalizedService[];
	language: LanguageCode;
};

const getTileStyle = (
	color: ServiceTileColor,
): React.CSSProperties | undefined => {
	if (color === "default") {
		return undefined;
	}

	return {
		background: `var(--scheme-${color})`,
		color: `var(--scheme-${color}-on)`,
	};
};

// Unlike the generic grid-4 content block (capped at 4 tiles by design), this
// grid shows every service the editor flagged for it, wrapping into as many
// rows of 4 as needed.
export const ServiceTiles: React.FC<ServiceTilesProps> = ({
	services,
	language,
}) => {
	const items = services.filter(
		(service) => service.language === language && service.tile,
	);

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
						style={getTileStyle(service.tileColor)}
					>
						{service.icon ? (
							<img
								className="service-tile__icon"
								src={service.icon}
								alt=""
								loading="lazy"
							/>
						) : (
							<div
								className="service-tile__icon service-tile__icon--placeholder"
								aria-hidden="true"
							/>
						)}
						<span className="service-tile__label">{service.name}</span>
					</li>
				))}
			</ul>
		</section>
	);
};
