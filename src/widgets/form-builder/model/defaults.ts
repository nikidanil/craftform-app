import type { FormInput, Question, QuestionType } from '@/entities/form';

const uid = () =>
	typeof crypto !== 'undefined' && 'randomUUID' in crypto
		? crypto.randomUUID()
		: `id-${Math.random().toString(36).slice(2, 10)}`;

export const makeEmptyQuestion = (
	type: QuestionType,
	order: number,
): Question => {
	const base = {
		id: uid(),
		type,
		body: '',
		required: false,
		order,
	} satisfies Pick<Question, 'id' | 'type' | 'body' | 'required' | 'order'>;

	if (type === 'choice') {
		return {
			...base,
			choiceVariant: 'single',
			options: [{ id: uid(), label: '' }],
		};
	}

	return base;
};

export const makeEmptyOption = () => ({ id: uid(), label: '' });

export const emptyFormInput = (): FormInput => ({
	title: '',
	description: '',
	questions: [],
});
