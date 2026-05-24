import { describe, expect, it } from 'vitest';

import type { Form } from '@/entities/form';

import { applyFormsListFilters } from '../applyFormsListFilters';
import type { SortOption } from '../sortOption';

const buildForm = (override: Partial<Form>): Form => ({
	id: 'form-x',
	title: 'Заглушка',
	description: '',
	questions: [],
	createdAt: '2026-01-01T00:00:00.000Z',
	authorId: 'author-1',
	...override,
});

const formAnketa = buildForm({
	id: 'form-a',
	title: 'Анкета',
	createdAt: '2026-01-01T00:00:00.000Z',
});
const formBron = buildForm({
	id: 'form-b',
	title: 'Бронь',
	createdAt: '2026-02-01T00:00:00.000Z',
});
const formViktorina = buildForm({
	id: 'form-c',
	title: 'Викторина',
	createdAt: '2026-03-01T00:00:00.000Z',
});

const baseForms = [formAnketa, formBron, formViktorina];
const baseCounts: Record<string, number> = {
	'form-a': 5,
	'form-b': 1,
	'form-c': 3,
};

describe('applyFormsListFilters', () => {
	it.each<[SortOption, string[]]>([
		['created-desc', ['form-c', 'form-b', 'form-a']],
		['created-asc', ['form-a', 'form-b', 'form-c']],
		['responses-desc', ['form-a', 'form-c', 'form-b']],
		['responses-asc', ['form-b', 'form-c', 'form-a']],
		['title-asc', ['form-a', 'form-b', 'form-c']],
		['title-desc', ['form-c', 'form-b', 'form-a']],
	])('сортирует по %s', (sort, expectedIds) => {
		const result = applyFormsListFilters(baseForms, baseCounts, {
			search: '',
			sort,
		});

		expect(result.map((form) => form.id)).toEqual(expectedIds);
	});

	it('фильтрует по подстроке без учёта регистра и обрезает пробелы', () => {
		const result = applyFormsListFilters(baseForms, baseCounts, {
			search: '  ВИКТ  ',
			sort: 'created-desc',
		});

		expect(result.map((form) => form.id)).toEqual(['form-c']);
	});

	it('возвращает пустой массив, если по запросу ничего не нашлось', () => {
		const result = applyFormsListFilters(baseForms, baseCounts, {
			search: 'отсутствующее название',
			sort: 'created-desc',
		});

		expect(result).toEqual([]);
	});

	it('сохраняет стабильный порядок по id при равенстве основного ключа', () => {
		const sameDay = '2026-01-01T00:00:00.000Z';
		const formAlpha = buildForm({
			id: 'form-z',
			title: 'Альфа',
			createdAt: sameDay,
		});
		const formBeta = buildForm({
			id: 'form-y',
			title: 'Бета',
			createdAt: sameDay,
		});
		const counts = { 'form-z': 2, 'form-y': 2 };

		const result = applyFormsListFilters([formAlpha, formBeta], counts, {
			search: '',
			sort: 'responses-desc',
		});

		expect(result.map((form) => form.id)).toEqual(['form-y', 'form-z']);
	});
});
