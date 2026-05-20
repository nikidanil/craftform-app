import { z } from 'zod';
import {
	formInputSchema,
	questionSchema,
	questionOptionSchema,
} from '@/entities/form';

const trimmedOption = questionOptionSchema.extend({
	label: z.string().min(1, 'Заполните вариант ответа'),
});

const refinedQuestion = questionSchema
	.extend({
		body: z.string().min(1, 'Введите текст вопроса'),
	})
	.superRefine((question, ctx) => {
		if (question.type !== 'choice') return;
		if (!question.options || question.options.length === 0) {
			ctx.addIssue({
				code: 'custom',
				path: ['options'],
				message: 'Добавьте хотя бы один вариант',
			});
			return;
		}
		question.options.forEach((option, optionIndex) => {
			const parsed = trimmedOption.safeParse(option);
			if (!parsed.success) {
				ctx.addIssue({
					code: 'custom',
					path: ['options', optionIndex, 'label'],
					message: 'Заполните вариант ответа',
				});
			}
		});
	});

export const formBuilderSchema = formInputSchema.extend({
	title: z.string().min(1, 'Введите название формы'),
	questions: z.array(refinedQuestion).min(1, 'Добавьте хотя бы один вопрос'),
});

export type FormBuilderValues = z.infer<typeof formBuilderSchema>;
