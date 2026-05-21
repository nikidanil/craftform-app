import { describe, expect, it } from 'vitest';

import { DEFAULT_SORT, isSortOption, SORT_OPTIONS } from '../sortOption';

describe('sortOption', () => {
	it('isSortOption отличает валидные значения от мусора', () => {
		expect(isSortOption('created-desc')).toBe(true);
		expect(isSortOption('title-asc')).toBe(true);
		expect(isSortOption('responses-asc')).toBe(true);
		expect(isSortOption('')).toBe(false);
		expect(isSortOption('бяка')).toBe(false);
		expect(isSortOption('created')).toBe(false);
	});

	it('DEFAULT_SORT — валидный SortOption', () => {
		expect(isSortOption(DEFAULT_SORT)).toBe(true);
	});

	it('SORT_OPTIONS содержит шесть уникальных вариантов с непустыми лейблами', () => {
		expect(SORT_OPTIONS).toHaveLength(6);

		const values = SORT_OPTIONS.map((option) => option.value);
		const uniqueValues = new Set(values);
		expect(uniqueValues.size).toBe(6);

		for (const option of SORT_OPTIONS) {
			expect(isSortOption(option.value)).toBe(true);
			expect(option.label.length).toBeGreaterThan(0);
		}
	});
});
