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
	.superRefine((q, ctx) => {
		if (q.type !== 'choice') return;
		if (!q.options || q.options.length === 0) {
			ctx.addIssue({
				code: 'custom',
				path: ['options'],
				message: 'Добавьте хотя бы один вариант',
			});
			return;
		}
		q.options.forEach((opt, idx) => {
			const parsed = trimmedOption.safeParse(opt);
			if (!parsed.success) {
				ctx.addIssue({
					code: 'custom',
					path: ['options', idx, 'label'],
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
