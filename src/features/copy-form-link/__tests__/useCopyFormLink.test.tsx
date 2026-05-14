import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCopyFormLink } from '../model/useCopyFormLink';

describe('useCopyFormLink', () => {
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
		const { result } = renderHook(() => useCopyFormLink());

		await act(async () => {
			await result.current.copy('form-42');
		});

		expect(writeText).toHaveBeenCalledWith(
			`${window.location.origin}/forms/form-42`,
		);
	});

	it('не падает при отсутствии formId — просто ничего не делает', async () => {
		const { result } = renderHook(() => useCopyFormLink());

		await act(async () => {
			await result.current.copy(undefined);
		});

		expect(writeText).not.toHaveBeenCalled();
	});
});
