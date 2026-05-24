import type { Form } from '@/entities/form';
import type { SubmissionInput } from '@/entities/submission';

export type FormFillValues = Record<string, string | string[]>;

export const buildDefaults = (form: Form): FormFillValues => {
	const values: FormFillValues = {};
	for (const question of form.questions) {
		if (question.type === 'choice' && question.choiceVariant === 'multiple') {
			values[question.id] = [];
		} else {
			values[question.id] = '';
		}
	}
	return values;
};

export const toSubmissionInput = (
	values: FormFillValues,
	form: Form,
): SubmissionInput => ({
	formId: form.id,
	answers: form.questions
		.map((question) => ({
			questionId: question.id,
			value: values[question.id] ?? '',
		}))
		.filter(({ value }) => {
			if (Array.isArray(value)) return value.length > 0;
			return (value as string).trim().length > 0;
		}),
});
