import type { Form } from '@/entities/form';
import type { SubmissionInput } from '@/entities/submission';

export type FormFillValues = Record<string, string | string[]>;

export const buildDefaults = (form: Form): FormFillValues => {
	const values: FormFillValues = {};
	for (const q of form.questions) {
		if (q.type === 'choice' && q.choiceVariant === 'multiple') {
			values[q.id] = [];
		} else {
			values[q.id] = '';
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
		.map((q) => ({ questionId: q.id, value: values[q.id] ?? '' }))
		.filter(({ value }) => {
			if (Array.isArray(value)) return value.length > 0;
			return (value as string).trim().length > 0;
		}),
});
