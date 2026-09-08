import * as React from "react";
import type { LanguageCode, NormalizedFaq } from "../../lib/content/types";
import { MarkdownContent } from "../../lib/content/markdown";

type FaqListProps = {
	faqs: NormalizedFaq[];
	language: LanguageCode;
};

export const FaqList: React.FC<FaqListProps> = ({ faqs, language }) => {
	const sorted = React.useMemo(
		() =>
			[...faqs]
				.filter((faq) => faq.language === language)
				.sort((a, b) => a.order - b.order),
		[faqs, language],
	);

	if (!sorted.length) {
		return null;
	}

	return (
		<div className="faq-list">
			{sorted.map((faq) => (
				<details className="faq-item" key={faq.id}>
					<summary className="faq-item__question">{faq.question}</summary>
					<div className="faq-item__answer">
						{faq.answer ? <MarkdownContent content={faq.answer} /> : null}
					</div>
				</details>
			))}
		</div>
	);
};
