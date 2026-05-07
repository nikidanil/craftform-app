import { z } from 'zod';

export const questionTypeSchema = z.enum(['short-text', 'long-text', 'choice']);
export type QuestionType = z.infer<typeof questionTypeSchema>;

export const questionOptionSchema = z.object({
	id: z.string(),
	label: z.string(),
});
export type QuestionOption = z.infer<typeof questionOptionSchema>;

export const questionSchema = z.object({
	id: z.string(),
	type: questionTypeSchema,
	body: z.string(),
	required: z.boolean(),
	order: z.number().int().nonnegative(),
	options: z.array(questionOptionSchema).optional(),
});
export type Question = z.infer<typeof questionSchema>;

export const formSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	questions: z.array(questionSchema),
	createdAt: z.string(),
});
export type Form = z.infer<typeof formSchema>;

export const formListSchema = z.array(formSchema);

export const formInputSchema = formSchema.omit({ id: true, createdAt: true });
export type FormInput = z.infer<typeof formInputSchema>;
