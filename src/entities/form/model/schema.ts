import { z } from 'zod';

export const questionTypeSchema = z.enum(['short-text', 'long-text', 'choice']);
export type QuestionType = z.infer<typeof questionTypeSchema>;

export const questionOptionSchema = z.object({
	id: z.string(),
	label: z.string(),
});
export type QuestionOption = z.infer<typeof questionOptionSchema>;

export const choiceVariantSchema = z.enum(['single', 'multiple']);
export type ChoiceVariant = z.infer<typeof choiceVariantSchema>;

export const questionSchema = z.object({
	id: z.string(),
	type: questionTypeSchema,
	body: z.string(),
	required: z.boolean(),
	order: z.number().int().nonnegative(),
	options: z.array(questionOptionSchema).optional(),
	choiceVariant: choiceVariantSchema.optional(),
});
export type Question = z.infer<typeof questionSchema>;

export const isChoiceQuestion = (
	question: Pick<Question, 'type'>,
): boolean => question.type === 'choice';

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
