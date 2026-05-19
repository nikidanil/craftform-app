import type { Submission } from './schema';

export const aggregateResponsesByForm = (
	responses: Pick<Submission, 'formId'>[],
): Record<string, number> => {
	const counts: Record<string, number> = {};

	for (const response of responses) {
		counts[response.formId] = (counts[response.formId] ?? 0) + 1;
	}

	return counts;
};
