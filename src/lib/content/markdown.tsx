import * as React from "react";

const trim = (value?: string | null): string | undefined => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
};

const normalizeInlineText = (value: string): string =>
	value.replace(/\r/g, "").replace(/static\/media\//g, "/media/");

const normalizeInlineUrl = (value: string): string | undefined => {
	const normalized = normalizeInlineText(value.trim());

	if (!normalized || normalized === "<>") {
		return undefined;
	}

	const unwrapped = normalized.match(/^<(.+)>$/)?.[1].trim() ?? normalized;

	return unwrapped ? unwrapped : undefined;
};

const renderFormattedText = (
	text: string,
	keyPrefix: string,
): React.ReactNode[] => {
	const nodes: React.ReactNode[] = [];
	const strongPattern = /\*\*([^*]+)\*\*/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = strongPattern.exec(text))) {
		if (match.index > lastIndex) {
			nodes.push(text.slice(lastIndex, match.index));
		}

		nodes.push(
			<strong key={`${keyPrefix}-strong-${match.index}`}>{match[1]}</strong>,
		);
		lastIndex = match.index + match[0].length;
	}

	if (lastIndex < text.length) {
		nodes.push(text.slice(lastIndex));
	}

	return nodes;
};

const renderInline = (text: string): React.ReactNode[] => {
	const nodes: React.ReactNode[] = [];
	const linkPattern = /\[([^\]]*)]\(([^)]+)\)/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = linkPattern.exec(text))) {
		if (match.index > lastIndex) {
			nodes.push(
				...renderFormattedText(
					text.slice(lastIndex, match.index),
					`text-${match.index}`,
				),
			);
		}

		const [, label, url] = match;
		const normalizedLabel = label.trim();
		const normalizedUrl = normalizeInlineUrl(url);

		if (normalizedLabel && normalizedUrl) {
			nodes.push(
				<a key={`${normalizedUrl}-${match.index}`} href={normalizedUrl}>
					{renderFormattedText(normalizedLabel, `link-${match.index}`)}
				</a>,
			);
		} else if (normalizedLabel) {
			nodes.push(
				...renderFormattedText(normalizedLabel, `label-${match.index}`),
			);
		}

		lastIndex = match.index + match[0].length;
	}

	if (lastIndex < text.length) {
		nodes.push(
			...renderFormattedText(text.slice(lastIndex), `text-${lastIndex}`),
		);
	}

	return nodes;
};

const renderParagraph = (paragraph: string, index: number): React.ReactNode => {
	const cleaned = normalizeInlineText(paragraph).replace(/\\\n/g, "\n").trim();

	if (/^(-\s*){3,}$/.test(cleaned) || /^([*_]\s*){3,}$/.test(cleaned)) {
		return <hr key={index} />;
	}

	if (cleaned.startsWith("#### ")) {
		return <h4 key={index}>{renderInline(cleaned.slice(5))}</h4>;
	}

	if (cleaned.startsWith("### ")) {
		return <h3 key={index}>{renderInline(cleaned.slice(4))}</h3>;
	}

	if (cleaned.startsWith("## ")) {
		return <h2 key={index}>{renderInline(cleaned.slice(3))}</h2>;
	}

	if (cleaned.startsWith("# ")) {
		return <h1 key={index}>{renderInline(cleaned.slice(2))}</h1>;
	}

	if (/^[-*] /.test(cleaned)) {
		const items = cleaned
			.split("\n")
			.map((line) => line.replace(/^[-*] /, "").trim())
			.filter(Boolean);

		return (
			<ul key={index}>
				{items.map((item) => (
					<li key={item}>{renderInline(item)}</li>
				))}
			</ul>
		);
	}

	return <p key={index}>{renderInline(cleaned)}</p>;
};

export const MarkdownContent: React.FC<{ content?: string | null }> = ({
	content,
}) => {
	const value = trim(content);

	if (!value) {
		return null;
	}

	return (
		<>
			{value
				.split(/\n{2,}/)
				.map((paragraph) => paragraph.trim())
				.filter(Boolean)
				.map(renderParagraph)}
		</>
	);
};
