// Telefonnummern kommen aus dem CMS in sehr gemischter Form: mal blank
// ("+43 512 58 76 06"), mal mit tel:-Präfix ("tel:+43512574861"), mal mit
// Leerzeichen am Rand (" +43 660 5747802"). Beide Helfer arbeiten deshalb
// zuerst auf dem getrimmten Wert und erst danach am Präfix.
const normalizePhone = (phone: string): string =>
	phone.trim().replace(/^tel:/i, "").trim();

// Was der Besucher liest: die Schreibweise der Redaktion, nur ohne tel:-Präfix
// und ohne doppelte Leerzeichen. Bewusst keine eigene Gruppierung der Ziffern —
// österreichische Vorwahlen sind unterschiedlich lang (512, 660, 59 120), eine
// automatische Formatierung würde die Nummern falsch lesbar machen.
export const formatPhoneLabel = (phone: string): string =>
	normalizePhone(phone).replace(/\s+/g, " ");

// Was das Telefon wählt: nur + und Ziffern.
export const getPhoneHref = (phone: string): string =>
	`tel:${normalizePhone(phone).replace(/[^+\d]/g, "")}`;

// Ob überhaupt eine wählbare Nummer hinterlegt ist.
export const hasDialableNumber = (phone?: string | null): boolean =>
	Boolean(phone && /\d/.test(normalizePhone(phone)));
