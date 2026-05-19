import type { Question } from '@/entities/form';
import type { Answer } from '@/entities/submission';

export const getSelectedOptionLabels = (
	question: Question,
	value: Answer['value'] | undefined,
): string[] => {
	if (!Array.isArray(value)) {
		return [];
	}
	const options = question.options ?? [];
	return value
		.map(
			(optionId) =>
				options.find((option) => option.id === optionId)?.label,
		)
		.filter((label): label is string => typeof label === 'string');
};
