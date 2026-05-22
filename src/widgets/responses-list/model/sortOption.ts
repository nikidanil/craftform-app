export const SORT_OPTIONS = [
	{ value: 'date-desc', label: 'Сначала новые' },
	{ value: 'date-asc', label: 'Сначала старые' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]['value'];

export const DEFAULT_SORT: SortOption = 'date-desc';

export const isSortOption = (value: string): value is SortOption =>
	SORT_OPTIONS.some((option) => option.value === value);
