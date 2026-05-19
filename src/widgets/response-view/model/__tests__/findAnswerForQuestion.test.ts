import { describe, expect, it } from 'vitest';

import type { Answer } from '@/entities/submission';

import { findAnswerForQuestion } from '../findAnswerForQuestion';

const answers: Answer[] = [
	{ questionId: 'q-1', value: 'Иван' },
	{ questionId: 'q-3', value: ['o-1', 'o-2'] },
];

describe('findAnswerForQuestion', () => {
	it('находит ответ по id вопроса', () => {
		expect(findAnswerForQuestion(answers, 'q-1')).toEqual({
			questionId: 'q-1',
			value: 'Иван',
		});
		expect(findAnswerForQuestion(answers, 'q-3')).toEqual({
			questionId: 'q-3',
			value: ['o-1', 'o-2'],
		});
	});

	it('возвращает undefined, если ответа на вопрос нет', () => {
		expect(findAnswerForQuestion(answers, 'q-unknown')).toBeUndefined();
		expect(findAnswerForQuestion([], 'q-1')).toBeUndefined();
	});
});
