import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import { http } from '@/shared/api';
import { createWrapper } from '@/test/test-utils';
import { useFormsByAuthor } from '../queries';

vi.mock('@/shared/api', () => ({ http: vi.fn() }));
const mockedHttp = vi.mocked(http);

const buildForm = (id: string, authorId: string) => ({
	id,
	title: `Форма ${id}`,
	description: '',
	questions: [],
	createdAt: '2026-04-15T10:00:00.000Z',
	authorId,
});

describe('useFormsByAuthor', () => {
	beforeEach(() => {
		mockedHttp.mockReset();
	});

	it('запрашивает формы автора через API-параметр authorId', async () => {
		mockedHttp.mockResolvedValueOnce([
			buildForm('form-1', 'user-1'),
			buildForm('form-3', 'user-1'),
		]);

		const { Wrapper } = createWrapper();
		const { result } = renderHook(() => useFormsByAuthor('user-1'), {
			wrapper: Wrapper,
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});
		expect(mockedHttp).toHaveBeenCalledWith('/api/forms?authorId=user-1');
		expect(result.current.data.map((form) => form.id)).toEqual([
			'form-1',
			'form-3',
		]);
	});

	it('не обращается к API и возвращает пустой массив, если authorId не задан', async () => {
		const { Wrapper } = createWrapper();
		const { result } = renderHook(() => useFormsByAuthor(undefined), {
			wrapper: Wrapper,
		});

		expect(result.current.data).toEqual([]);
		expect(mockedHttp).not.toHaveBeenCalled();
	});
});
