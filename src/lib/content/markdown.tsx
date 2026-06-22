import * as React from "react";

const trim = (value?: string | null): string | undefined => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
};

const renderInline = (text: string): React.ReactNode[] => {
	const nodes: React.ReactNode[] = [];
	const linkPattern = /\[([^\]]+)]\(([^)]+)\)/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = linkPattern.exec(text))) {
		if (match.index > lastIndex) {
			nodes.push(text.slice(lastIndex, match.index));
		}

		const [, label, url] = match;
		if (label && url) {
			nodes.push(
				<a key={`${url}-${match.index}`} href={url}>
					{label}
				</a>,
			);
		}

		lastIndex = match.index + match[0].length;
	}

	if (lastIndex < text.length) {
		nodes.push(text.slice(lastIndex));
	}

	return nodes;
};

const renderParagraph = (paragraph: string, index: number): React.ReactNode => {
	const cleaned = paragraph.replace(/\\\n/g, "\n").trim();

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

export const MarkdownContent: React.FC<{ content?: string | null }> = ({ content }) => {
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
