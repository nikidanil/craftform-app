export const SORT_OPTIONS = [
	{ value: 'created-desc', label: 'Сначала новые' },
	{ value: 'created-asc', label: 'Сначала старые' },
	{ value: 'responses-desc', label: 'Больше откликов' },
	{ value: 'responses-asc', label: 'Меньше откликов' },
	{ value: 'title-asc', label: 'По названию: А–Я' },
	{ value: 'title-desc', label: 'По названию: Я–А' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]['value'];

export const DEFAULT_SORT: SortOption = 'created-desc';

export const isSortOption = (value: string): value is SortOption =>
	SORT_OPTIONS.some((option) => option.value === value);
