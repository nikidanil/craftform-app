import type { Question } from '../model';

/** Истинно для вопроса с однострочным текстовым ответом. */
export const isShortTextQuestion = (
	question: Pick<Question, 'type'>,
): boolean => question.type === 'short-text';

/** Истинно для вопроса с многострочным текстовым ответом. */
export const isLongTextQuestion = (
	question: Pick<Question, 'type'>,
): boolean => question.type === 'long-text';

/** Истинно для вопроса с выбором варианта (переключатели или флажки). */
export const isChoiceQuestion = (
	question: Pick<Question, 'type'>,
): boolean => question.type === 'choice';
