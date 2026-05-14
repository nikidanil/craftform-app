import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { http } from '@/shared/api';
import { useDeleteFormAction } from '../model/useDeleteFormAction';

vi.mock('@/shared/api', () => ({ http: vi.fn() }));
const mockedHttp = vi.mocked(http);

const pathRef = { current: '/' };
const LocationSpy = () => {
	const loc = useLocation();
	pathRef.current = loc.pathname;
	return null;
};

const buildWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={['/forms/form-1/edit']}>
				<Routes>
					<Route path='/forms/:formId/edit' element={<>{children}</>} />
					<Route path='/' element={<div data-testid='home'>home</div>} />
				</Routes>
				<LocationSpy />
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe('useDeleteFormAction', () => {
	beforeEach(() => {
		mockedHttp.mockReset();
		pathRef.current = '/forms/form-1/edit';
	});

	it('после успешного удаления формы переходит на /', async () => {
		mockedHttp.mockImplementation(async (url) => {
			if (url.startsWith('/api/responses?formId=')) return [];
			return undefined;
		});

		const { result } = renderHook(() => useDeleteFormAction(), {
			wrapper: buildWrapper(),
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

		const { result } = renderHook(() => useDeleteFormAction(), {
			wrapper: buildWrapper(),
		});

		await act(async () => {
			await result.current.deleteForm('form-1');
		});

		await waitFor(() => expect(result.current.error).not.toBeNull());
		expect(pathRef.current).toBe('/forms/form-1/edit');
	});
});
