import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

import { http } from '@/shared/api';
import { createWrapper } from '@/test/test-utils';
import { useDeleteFormAction } from '../model/useDeleteFormAction';

vi.mock('@/shared/api', () => ({ http: vi.fn() }));
const mockedHttp = vi.mocked(http);

describe('useDeleteFormAction', () => {
	beforeEach(() => {
		mockedHttp.mockReset();
	});

	it('после успешного удаления формы переходит на /', async () => {
		mockedHttp.mockImplementation(async (url) => {
			if (url.startsWith('/api/responses?formId=')) return [];
			return undefined;
		});

		const { Wrapper, pathRef } = createWrapper({
			initialEntries: ['/forms/form-1/edit'],
		});
		const { result } = renderHook(() => useDeleteFormAction(), {
			wrapper: Wrapper,
		});

		await act(async () => {
			await result.current.deleteForm('form-1');
		});

		await waitFor(() => expect(pathRef.current).toBe('/'));
		expect(result.current.error).toBeNull();
	});

	it('при ошибке выставляет error и не редиректит', async () => {
		mockedHttp.mockImplementation(async (url) => {
			if (url.startsWith('/api/responses?formId=')) return [];
			throw new Error('boom');
		});

		const { Wrapper, pathRef } = createWrapper({
			initialEntries: ['/forms/form-1/edit'],
		});
		const { result } = renderHook(() => useDeleteFormAction(), {
			wrapper: Wrapper,
		});

		await act(async () => {
			await result.current.deleteForm('form-1');
		});

		await waitFor(() => expect(result.current.error).not.toBeNull());
		expect(pathRef.current).toBe('/forms/form-1/edit');
	});
});
