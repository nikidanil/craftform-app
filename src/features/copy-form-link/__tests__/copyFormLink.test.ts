import { describe, expect, it, vi, beforeEach } from 'vitest';
import { copyFormLink } from '../lib/copyFormLink';

describe('copyFormLink', () => {
	const writeText = vi.fn();

	beforeEach(() => {
		writeText.mockReset();
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: { writeText },
		});
	});

	it('копирует абсолютный публичный URL формы', async () => {
		writeText.mockResolvedValue(undefined);

		const copied = await copyFormLink('form-42');

		expect(copied).toBe(true);
		expect(writeText).toHaveBeenCalledWith(
			`${window.location.origin}/forms/form-42`,
		);
	});

	it('не копирует и возвращает false при отсутствии formId', async () => {
		const copied = await copyFormLink(undefined);

		expect(copied).toBe(false);
		expect(writeText).not.toHaveBeenCalled();
	});

	it('возвращает false, если запись в буфер обмена упала', async () => {
		writeText.mockRejectedValue(new Error('denied'));

		const copied = await copyFormLink('form-42');

		expect(copied).toBe(false);
	});
});
