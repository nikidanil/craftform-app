import { describe, expect, it } from 'vitest';
import type { QuestionType } from '../../model';
import {
	isChoiceQuestion,
	isLongTextQuestion,
	isShortTextQuestion,
} from '../questionPredicates';

const shortText: { type: QuestionType } = { type: 'short-text' };
const longText: { type: QuestionType } = { type: 'long-text' };
const choice: { type: QuestionType } = { type: 'choice' };

describe('предикаты типа вопроса', () => {
	it('isShortTextQuestion истинен только для short-text', () => {
		expect(isShortTextQuestion(shortText)).toBe(true);
		expect(isShortTextQuestion(longText)).toBe(false);
		expect(isShortTextQuestion(choice)).toBe(false);
	});

	it('isLongTextQuestion истинен только для long-text', () => {
		expect(isLongTextQuestion(longText)).toBe(true);
		expect(isLongTextQuestion(shortText)).toBe(false);
		expect(isLongTextQuestion(choice)).toBe(false);
	});

	it('isChoiceQuestion истинен только для choice', () => {
		expect(isChoiceQuestion(choice)).toBe(true);
		expect(isChoiceQuestion(shortText)).toBe(false);
		expect(isChoiceQuestion(longText)).toBe(false);
	});
});
