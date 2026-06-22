import type { NormalizedCategory } from "./types";

export type ResolvedCategory = Pick<NormalizedCategory, "name" | "slug" | "uuid">;

export const normalizeCategoryKey = (value: string): string =>
	value.trim().toLowerCase();

export const resolveCategories = (
	categoryUuids: string[] | null | undefined,
	categories: NormalizedCategory[],
	language: string,
): ResolvedCategory[] => {
	const categoryByUuid = new Map(
		categories
			.filter((category) => category.language === language)
			.map((category) => [normalizeCategoryKey(category.uuid), category]),
	);
	const resolvedCategories: ResolvedCategory[] = [];
	const usedUuids = new Set<string>();

	for (const categoryUuid of categoryUuids ?? []) {
		const key = normalizeCategoryKey(categoryUuid);
		const category = categoryByUuid.get(key);

		if (!category || usedUuids.has(key)) {
			continue;
		}

		usedUuids.add(key);
		resolvedCategories.push({
			name: category.name,
			slug: category.slug,
			uuid: category.uuid,
		});
	}

	return resolvedCategories;
};

export const resolveCategoryLabels = (
	categoryUuids: string[] | null | undefined,
	categories: NormalizedCategory[],
	language: string,
	fallbackLabel: string,
): string[] => {
	const labels = resolveCategories(categoryUuids, categories, language).map(
		(category) => category.name,
	);

	return labels.length ? labels : [fallbackLabel];
};
