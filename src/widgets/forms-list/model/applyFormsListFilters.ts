import type { Form } from '@/entities/form';

import type { SortOption } from './sortOption';

type Params = {
	search: string;
	sort: SortOption;
};

const compareByPrimary = (
	left: Form,
	right: Form,
	responsesCountByForm: Record<string, number>,
	sort: SortOption,
): number => {
	switch (sort) {
		case 'created-desc':
			return right.createdAt.localeCompare(left.createdAt);
		case 'created-asc':
			return left.createdAt.localeCompare(right.createdAt);
		case 'responses-desc':
			return (
				(responsesCountByForm[right.id] ?? 0) -
				(responsesCountByForm[left.id] ?? 0)
			);
		case 'responses-asc':
			return (
				(responsesCountByForm[left.id] ?? 0) -
				(responsesCountByForm[right.id] ?? 0)
			);
		case 'title-asc':
			return left.title.localeCompare(right.title, 'ru');
		case 'title-desc':
			return right.title.localeCompare(left.title, 'ru');
	}
};

export const applyFormsListFilters = (
	forms: Form[],
	responsesCountByForm: Record<string, number>,
	{ search, sort }: Params,
): Form[] => {
	const normalizedSearch = search.trim().toLowerCase();

	const filtered =
		normalizedSearch.length === 0
			? forms
			: forms.filter((form) =>
					form.title.toLowerCase().includes(normalizedSearch),
				);

	return filtered.toSorted((left, right) => {
		const primary = compareByPrimary(left, right, responsesCountByForm, sort);
		return primary !== 0 ? primary : left.id.localeCompare(right.id);
	});
};
