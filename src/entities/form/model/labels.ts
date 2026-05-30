import type { QuestionType } from './schema';

/** Человекочитаемые названия типов вопроса для UI. */
export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
	'short-text': 'Короткий текст',
	'long-text': 'Длинный текст',
	choice: 'Список выбора',
};
