import type { Answer } from '@/entities/submission';

export const findAnswerForQuestion = (
	answers: Answer[],
	questionId: string,
): Answer | undefined =>
	answers.find((answer) => answer.questionId === questionId);
