import type { Submission } from '@/entities/submission';

import type { SortOption } from './sortOption';

type Params = {
	sort: SortOption;
	dateFrom: string;
	dateTo: string;
};

const compareByCreatedAt = (
	left: Submission,
	right: Submission,
	sort: SortOption,
): number =>
	sort === 'date-desc'
		? right.createdAt.localeCompare(left.createdAt)
		: left.createdAt.localeCompare(right.createdAt);

export const applyResponsesListFilters = (
	responses: Submission[],
	{ sort, dateFrom, dateTo }: Params,
): Submission[] => {
	const filtered = responses.filter((response) => {
		const day = response.createdAt.slice(0, 10);
		if (dateFrom !== '' && day < dateFrom) {
			return false;
		}
		if (dateTo !== '' && day > dateTo) {
			return false;
		}
		return true;
	});

	return filtered.toSorted((left, right) => {
		const primary = compareByCreatedAt(left, right, sort);
		return primary !== 0 ? primary : left.number - right.number;
	});
};
