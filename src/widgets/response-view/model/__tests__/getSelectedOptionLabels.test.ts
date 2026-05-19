import { describe, expect, it } from 'vitest';

import type { Question } from '@/entities/form';

import { getSelectedOptionLabels } from '../getSelectedOptionLabels';

const choiceQuestion: Question = {
	id: 'q-1',
	type: 'choice',
	body: 'Как вы узнали о нас?',
	required: true,
	order: 0,
	choiceVariant: 'multiple',
	options: [
		{ id: 'o-1', label: 'Через поиск' },
		{ id: 'o-2', label: 'Рекомендация друга' },
		{ id: 'o-3', label: 'Реклама' },
	],
};

describe('getSelectedOptionLabels', () => {
	it('для одиночного выбора возвращает один лейбл', () => {
		expect(getSelectedOptionLabels(choiceQuestion, ['o-2'])).toEqual([
			'Рекомендация друга',
		]);
	});

	it('для множественного выбора возвращает все выбранные лейблы по порядку value', () => {
		expect(getSelectedOptionLabels(choiceQuestion, ['o-3', 'o-1'])).toEqual([
			'Реклама',
			'Через поиск',
		]);
	});

	it('пропускает неизвестные id вариантов', () => {
		expect(
			getSelectedOptionLabels(choiceQuestion, ['o-1', 'o-missing']),
		).toEqual(['Через поиск']);
	});

	it('при value-строке возвращает пустой массив', () => {
		expect(getSelectedOptionLabels(choiceQuestion, 'o-1')).toEqual([]);
	});

	it('при undefined value возвращает пустой массив', () => {
		expect(getSelectedOptionLabels(choiceQuestion, undefined)).toEqual([]);
	});

	it('у вопроса без options возвращает пустой массив', () => {
		const questionWithoutOptions: Question = {
			...choiceQuestion,
			options: undefined,
		};
		expect(
			getSelectedOptionLabels(questionWithoutOptions, ['o-1']),
		).toEqual([]);
	});
});
