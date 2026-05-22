import { describe, expect, it } from 'vitest';

import type { Submission } from '@/entities/submission';

import { applyResponsesListFilters } from '../applyResponsesListFilters';
import type { SortOption } from '../sortOption';

const buildResponse = (overrides: Partial<Submission>): Submission => ({
	id: 'r-x',
	formId: 'form-1',
	number: 1,
	createdAt: '2026-01-01T12:00:00.000Z',
	answers: [],
	...overrides,
});

const january = buildResponse({
	id: 'r-january',
	number: 1,
	createdAt: '2026-01-10T12:00:00.000Z',
});
const february = buildResponse({
	id: 'r-february',
	number: 2,
	createdAt: '2026-02-10T12:00:00.000Z',
});
const march = buildResponse({
	id: 'r-march',
	number: 3,
	createdAt: '2026-03-10T12:00:00.000Z',
});

const baseResponses = [february, january, march];

describe('applyResponsesListFilters', () => {
	it.each<[SortOption, string[]]>([
		['date-desc', ['r-march', 'r-february', 'r-january']],
		['date-asc', ['r-january', 'r-february', 'r-march']],
	])('сортирует по %s', (sort, expectedIds) => {
		const result = applyResponsesListFilters(baseResponses, {
			sort,
			dateFrom: '',
			dateTo: '',
		});

		expect(result.map((response) => response.id)).toEqual(expectedIds);
	});

	it('фильтр dateFrom включителен и отсекает более ранние', () => {
		const result = applyResponsesListFilters(baseResponses, {
			sort: 'date-asc',
			dateFrom: '2026-02-10',
			dateTo: '',
		});

		expect(result.map((response) => response.id)).toEqual([
			'r-february',
			'r-march',
		]);
	});

	it('фильтр dateTo включителен и отсекает более поздние', () => {
		const result = applyResponsesListFilters(baseResponses, {
			sort: 'date-asc',
			dateFrom: '',
			dateTo: '2026-02-10',
		});

		expect(result.map((response) => response.id)).toEqual([
			'r-january',
			'r-february',
		]);
	});

	it('одновременный фильтр dateFrom+dateTo с сортировкой — оставляет диапазон', () => {
		const result = applyResponsesListFilters(baseResponses, {
			sort: 'date-desc',
			dateFrom: '2026-02-01',
			dateTo: '2026-02-28',
		});

		expect(result.map((response) => response.id)).toEqual(['r-february']);
	});

	it('возвращает пустой массив, если диапазон ничего не охватывает', () => {
		const result = applyResponsesListFilters(baseResponses, {
			sort: 'date-desc',
			dateFrom: '2027-01-01',
			dateTo: '2027-12-31',
		});

		expect(result).toEqual([]);
	});

	it('сохраняет стабильный порядок по number при равенстве createdAt', () => {
		const sameMoment = '2026-04-01T12:00:00.000Z';
		const second = buildResponse({
			id: 'r-second',
			number: 2,
			createdAt: sameMoment,
		});
		const first = buildResponse({
			id: 'r-first',
			number: 1,
			createdAt: sameMoment,
		});

		const result = applyResponsesListFilters([second, first], {
			sort: 'date-desc',
			dateFrom: '',
			dateTo: '',
		});

		expect(result.map((response) => response.id)).toEqual([
			'r-first',
			'r-second',
		]);
	});
});
