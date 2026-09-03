import * as React from "react";
import type { LanguageCode, NormalizedService } from "../../lib/content/types";

type ServiceAZListProps = {
	services: NormalizedService[];
	language: LanguageCode;
};

type ServiceGroup = {
	letter: string;
	items: NormalizedService[];
};

// Every service, regardless of the "Als Kachel anzeigen" flag, sorted and
// bucketed by the first letter of its name — the tile grid above only ever
// shows a subset, this list is the full directory.
const groupByFirstLetter = (
	services: NormalizedService[],
	language: LanguageCode,
): ServiceGroup[] => {
	const sorted = [...services]
		.filter((service) => service.language === language)
		.sort((a, b) => a.name.localeCompare(b.name, language));

	// The locale-aware sort above can interleave e.g. "Ä" between two "A"
	// entries (German collation treats it as a near-neighbour of "A", not an
	// equal), so grouping must key by letter rather than only checking
	// whether the previous entry matches — otherwise the same letter can
	// produce two separate, non-adjacent groups.
	const itemsByLetter = new Map<string, NormalizedService[]>();

	for (const service of sorted) {
		const letter = service.name.charAt(0).toUpperCase();
		const items = itemsByLetter.get(letter);

		if (items) {
			items.push(service);
		} else {
			itemsByLetter.set(letter, [service]);
		}
	}

	return [...itemsByLetter.entries()].map(([letter, items]) => ({
		letter,
		items,
	}));
};

export const ServiceAZList: React.FC<ServiceAZListProps> = ({
	services,
	language,
}) => {
	const groups = groupByFirstLetter(services, language);

	if (!groups.length) {
		return null;
	}

	return (
		<div className="service-az-list">
			{groups.map((group) => (
				<section
					className="service-az-group"
					aria-labelledby={`service-az-${group.letter}`}
					key={group.letter}
				>
					<h3
						className="service-az-group__letter"
						id={`service-az-${group.letter}`}
					>
						{group.letter}
					</h3>
					<ul className="service-az-group__items">
						{group.items.map((service) => (
							<li className="service-az-item" key={service.id}>
								<span className="service-az-item__name">{service.name}</span>
								{service.description ? (
									<span className="service-az-item__description">
										{service.description}
									</span>
								) : null}
							</li>
						))}
					</ul>
				</section>
			))}
		</div>
	);
};
