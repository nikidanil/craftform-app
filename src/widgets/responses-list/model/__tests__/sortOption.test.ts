import { describe, expect, it } from 'vitest';

import { DEFAULT_SORT, isSortOption, SORT_OPTIONS } from '../sortOption';

describe('sortOption', () => {
	it('isSortOption отличает валидные значения от мусора', () => {
		expect(isSortOption('date-desc')).toBe(true);
		expect(isSortOption('date-asc')).toBe(true);
		expect(isSortOption('')).toBe(false);
		expect(isSortOption('бяка')).toBe(false);
		expect(isSortOption('created-desc')).toBe(false);
	});

	it('DEFAULT_SORT — валидный SortOption и сортирует от новых к старым', () => {
		expect(isSortOption(DEFAULT_SORT)).toBe(true);
		expect(DEFAULT_SORT).toBe('date-desc');
	});

	it('SORT_OPTIONS содержит два уникальных варианта с непустыми лейблами', () => {
		expect(SORT_OPTIONS).toHaveLength(2);

		const values = SORT_OPTIONS.map((option) => option.value);
		const uniqueValues = new Set(values);
		expect(uniqueValues.size).toBe(2);

		for (const option of SORT_OPTIONS) {
			expect(isSortOption(option.value)).toBe(true);
			expect(option.label.length).toBeGreaterThan(0);
		}
	});
});
