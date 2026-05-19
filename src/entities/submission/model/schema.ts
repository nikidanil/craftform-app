import { z } from 'zod';

export const answerSchema = z.object({
	questionId: z.string(),
	value: z.union([z.string(), z.array(z.string())]),
});
export type Answer = z.infer<typeof answerSchema>;

export const submissionSchema = z.object({
	id: z.string(),
	formId: z.string(),
	number: z.number().int().positive(),
	createdAt: z.string(),
	answers: z.array(answerSchema),
});
export type Submission = z.infer<typeof submissionSchema>;

export const submissionListSchema = z.array(submissionSchema);

export const submissionInputSchema = submissionSchema.pick({
	formId: true,
	answers: true,
});
export type SubmissionInput = z.infer<typeof submissionInputSchema>;
