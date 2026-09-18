// Markdown-Syntax aus einem Text entfernen, um daraus einen Anriss zu bauen.
//
// Entscheidend ist, nur das zu entfernen, was an seiner Stelle wirklich Syntax
// ist. Ein pauschales `replace(/[>*_`~-]/g, "")` riss die Bindestriche mitten
// aus den Wörtern ("Original-Rezepten" wurde zu "OriginalRezepten",
// "Maria-Theresien-Straße" zu "MariaTheresienStraße"), während der harte
// Zeilenumbruch "\" am Zeilenende umgekehrt im Text stehen blieb.
export const stripMarkdownText = (value: string): string =>
	value
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "")
		.replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
		.replace(/^#{1,6}\s+/gm, "")
		.replace(/^\s*-{3,}\s*$/gm, "")
		.replace(/^\s*[-*+>]\s+/gm, "")
		.replace(/(\*\*|__)(.*?)\1/g, "$2")
		.replace(/(\*|_)(?=\S)(.*?\S)\1/g, "$2")
		.replace(/~~(.*?)~~/g, "$1")
		.replace(/`([^`]*)`/g, "$1")
		.replace(/\\(?=\s|$)/g, " ")
		.replace(/\s+/g, " ")
		.trim();

export const truncateText = (value: string, maxLength: number): string => {
	if (value.length <= maxLength) {
		return value;
	}

	const truncated = value
		.slice(0, maxLength)
		.replace(/\s+\S*$/, "")
		.trim();

	return `${truncated || value.slice(0, maxLength).trim()} …`;
};

// Ersten echten Absatz eines Markdown-Textes als Anriss.
export const getBodyExcerpt = (
	body?: string,
	maxLength = 155,
): string | undefined => {
	const paragraph = body
		?.split(/\n{2,}/)
		.map(stripMarkdownText)
		.find(Boolean);

	return paragraph ? truncateText(paragraph, maxLength) : undefined;
};
