import { describe, expect, it } from 'vitest';
import { formatSubmittedAt } from '../formatSubmittedAt';

describe('formatSubmittedAt', () => {
	it.each([
		['2025-05-02T14:32:00', '02.05.2025, 14:32'],
		['2026-01-09T00:00:00', '09.01.2026, 00:00'],
		['2026-12-31T23:59:00', '31.12.2026, 23:59'],
		['2026-03-05T07:08:00', '05.03.2026, 07:08'],
	])('для %s возвращает "%s"', (iso, expected) => {
		expect(formatSubmittedAt(iso)).toBe(expected);
	});
});
