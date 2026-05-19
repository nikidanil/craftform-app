import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpError } from '@/shared/api';
import { useSubmitResponse } from '@/entities/submission';
import { createWrapper } from '@/test/test-utils';
import { useSubmitResponseAction } from '../model/useSubmitResponseAction';
import type { SubmissionInput } from '@/entities/submission';

vi.mock('@/entities/submission', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/entities/submission')>();
	return { ...actual, useSubmitResponse: vi.fn() };
});

const mockedUseSubmitResponse = vi.mocked(useSubmitResponse);

const input: SubmissionInput = {
	formId: 'form-1',
	answers: [{ questionId: 'q-1', value: 'Иван' }],
};

const makeMockMutate = (
	impl: (input: SubmissionInput, options?: { onSuccess?: () => void; onError?: (err: unknown) => void }) => void,
) => {
	mockedUseSubmitResponse.mockReturnValue({
		mutate: impl,
	} as unknown as ReturnType<typeof useSubmitResponse>);
};

const { Wrapper } = createWrapper();

describe('useSubmitResponseAction', () => {
	beforeEach(() => mockedUseSubmitResponse.mockReset());

	it('успешная отправка: статус success, errorMessage null', async () => {
		makeMockMutate((_input, options) => {
			options?.onSuccess?.();
		});

		const { result } = renderHook(() => useSubmitResponseAction(), { wrapper: Wrapper });

		act(() => result.current.submit(input));

		await waitFor(() => expect(result.current.status).toBe('success'));
		expect(result.current.errorMessage).toBeNull();
	});

	it('сетевая ошибка: статус error, fallback-текст', async () => {
		makeMockMutate((_input, options) => {
			options?.onError?.(new Error('network'));
		});

		const { result } = renderHook(() => useSubmitResponseAction(), { wrapper: Wrapper });

		act(() => result.current.submit(input));

		await waitFor(() => expect(result.current.status).toBe('error'));
		expect(result.current.errorMessage).toBe(
			'Не удалось отправить отклик. Попробуйте ещё раз.',
		);
	});

	it('HttpError с JSON-body: берёт message из ответа API', async () => {
		makeMockMutate((_input, options) => {
			options?.onError?.(
				new HttpError(500, 'Internal Server Error', JSON.stringify({ message: 'Форма удалена' })),
			);
		});

		const { result } = renderHook(() => useSubmitResponseAction(), { wrapper: Wrapper });

		act(() => result.current.submit(input));

		await waitFor(() => expect(result.current.status).toBe('error'));
		expect(result.current.errorMessage).toBe('Форма удалена');
	});
});
