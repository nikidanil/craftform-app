import { describe, expect, it } from 'vitest';
import { formatCreatedAt } from '../formatCreatedAt';

describe('formatCreatedAt', () => {
	it('возвращает "Создана сегодня" если дата совпадает с now', () => {
		const now = new Date('2026-05-16T12:00:00');
		expect(formatCreatedAt('2026-05-16T08:30:00', now)).toBe(
			'Создана сегодня',
		);
	});

	it('форматирует прошедшую дату с русским месяцем и годом', () => {
		const now = new Date('2026-05-16T12:00:00');
		expect(formatCreatedAt('2026-04-15T10:00:00', now)).toBe(
			'Создана 15 апреля 2026',
		);
	});

	it('форматирует дату из прошлого года', () => {
		const now = new Date('2026-05-16T12:00:00');
		expect(formatCreatedAt('2025-12-31T23:00:00', now)).toBe(
			'Создана 31 декабря 2025',
		);
	});
});
