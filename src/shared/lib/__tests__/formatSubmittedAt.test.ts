/// <reference types="node" />
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { formatSubmittedAt } from '../formatSubmittedAt';

// Контракт — локальное время зрителя. Фиксируем зону на Europe/Moscow
// (UTC+3, без перехода на летнее время), чтобы кейсы с Z/смещением были
// детерминированы независимо от машины.
const originalTimezone = process.env.TZ;

describe('formatSubmittedAt', () => {
	beforeAll(() => {
		process.env.TZ = 'Europe/Moscow';
	});

	afterAll(() => {
		if (originalTimezone === undefined) {
			delete process.env.TZ;
		} else {
			process.env.TZ = originalTimezone;
		}
	});

	it.each([
		// Метка без зоны трактуется как локальная — отображается как есть.
		['2025-05-02T14:32:00', '02.05.2025, 14:32'],
		['2026-03-05T07:08:00', '05.03.2026, 07:08'],
	])('метку без зоны %s показывает как локальную: %s', (iso, expected) => {
		expect(formatSubmittedAt(iso)).toBe(expected);
	});

	it.each([
		// UTC-метка (Z) конвертируется в местное время (+3 часа).
		['2025-05-02T14:32:00Z', '02.05.2025, 17:32'],
		// Перенос суток и года при конвертации из UTC.
		['2026-12-31T23:59:00Z', '01.01.2027, 02:59'],
		// Явное смещение: 14:32+05:00 → 09:32Z → 12:32 МСК.
		['2025-05-02T14:32:00+05:00', '02.05.2025, 12:32'],
	])('метку с зоной %s конвертирует в локальную: %s', (iso, expected) => {
		expect(formatSubmittedAt(iso)).toBe(expected);
	});
});
