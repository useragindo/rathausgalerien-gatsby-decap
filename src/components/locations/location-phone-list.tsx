import * as React from "react";
import {
	formatPhoneLabel,
	getPhoneHref,
	hasDialableNumber,
} from "../../lib/content/contact";
import type { LanguageCode, NormalizedLocation } from "../../lib/content/types";

type LocationPhoneListProps = {
	locations: NormalizedLocation[];
	language: LanguageCode;
};

type PhoneEntry = {
	id: string;
	title: string;
	path: string;
	label: string;
	href: string;
};

// Jede Location der aktuellen Sprache, die eine wählbare Nummer hinterlegt hat,
// alphabetisch nach Namen. Locations ohne Nummer fallen raus, statt eine leere
// Zeile zu erzeugen.
const collectPhoneEntries = (
	locations: NormalizedLocation[],
	language: LanguageCode,
): PhoneEntry[] =>
	locations
		.filter(
			(location) =>
				location.language === language &&
				hasDialableNumber(location.frontmatter.contact?.phone),
		)
		.map((location) => {
			const phone = location.frontmatter.contact?.phone ?? "";

			return {
				id: location.id,
				title: location.title,
				path: location.path,
				label: formatPhoneLabel(phone),
				href: getPhoneHref(phone),
			};
		})
		.sort((a, b) => a.title.localeCompare(b.title, language));

export const LocationPhoneList: React.FC<LocationPhoneListProps> = ({
	locations,
	language,
}) => {
	const entries = collectPhoneEntries(locations, language);

	if (!entries.length) {
		return null;
	}

	return (
		<ul className="phone-list">
			{entries.map((entry) => (
				<li className="phone-list__row" key={entry.id}>
					<a className="phone-list__name" href={entry.path}>
						{entry.title}
					</a>
					<a className="phone-list__number" href={entry.href}>
						{entry.label}
					</a>
				</li>
			))}
		</ul>
	);
};
