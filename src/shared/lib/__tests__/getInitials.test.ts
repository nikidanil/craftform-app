import { describe, expect, it } from 'vitest';

import { getInitials } from '../getInitials';

describe('getInitials', () => {
	it('берёт первые буквы имени и фамилии в верхнем регистре', () => {
		expect(getInitials('Иван', 'Иванов')).toBe('ИИ');
	});

	it('возвращает пустую строку, если имя и фамилия пусты', () => {
		expect(getInitials('', '')).toBe('');
	});

	it('возвращает одну букву, если фамилия пуста', () => {
		expect(getInitials('Пётр', '')).toBe('П');
	});
});
