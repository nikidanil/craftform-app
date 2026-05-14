import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { http } from '@/shared/api';
import { useSaveForm } from '../model/useSaveForm';
import type { FormInput } from '@/entities/form';

vi.mock('@/shared/api', () => ({
	http: vi.fn(),
}));

const mockedHttp = vi.mocked(http);

const pathRef = { current: '/' };
const LocationSpy = () => {
	const loc = useLocation();
	pathRef.current = loc.pathname;
	return null;
};

const wrapperFactory = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: 0, staleTime: 0 },
			mutations: { retry: false },
		},
	});
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={['/forms/new']}>
				<Routes>
					<Route path='/forms/new' element={<>{children}</>} />
					<Route
						path='/forms/:formId/edit'
						element={<div data-testid='edit-page'>edit</div>}
					/>
				</Routes>
				<LocationSpy />
			</MemoryRouter>
		</QueryClientProvider>
	);
	return { wrapper };
};

const baseInput: FormInput = {
	title: 'Новая форма',
	description: '',
	questions: [
		{
			id: 'q-1',
			type: 'short-text',
			body: 'Имя',
			required: true,
			order: 0,
		},
	],
};

describe('useSaveForm', () => {
	beforeEach(() => {
		mockedHttp.mockReset();
		pathRef.current = '/forms/new';
	});

	it('создаёт форму POST → /api/forms и редиректит на /forms/:formId/edit', async () => {
		mockedHttp.mockImplementation(async (url, init) => {
			expect(url).toBe('/api/forms');
			expect(init?.method).toBe('POST');
			const payload = init?.body as { id: string };
			return { ...(init?.body as object), id: payload.id };
		});

		const { wrapper } = wrapperFactory();
		const { result } = renderHook(() => useSaveForm({ mode: 'create' }), {
			wrapper,
		});

		await act(async () => {
			await result.current.save(baseInput);
		});

		await waitFor(() => {
			expect(pathRef.current).toMatch(/^\/forms\/[^/]+\/edit$/);
		});
		expect(result.current.error).toBeNull();
	});

	it('обновляет форму PATCH → /api/forms/:formId без редиректа', async () => {
		mockedHttp.mockImplementation(async (url, init) => {
			expect(url).toBe('/api/forms/form-1');
			expect(init?.method).toBe('PATCH');
			return {
				id: 'form-1',
				title: 'Обновлено',
				description: '',
				questions: baseInput.questions,
				createdAt: '2026-01-01T00:00:00.000Z',
			};
		});

		const { wrapper } = wrapperFactory();
		const { result } = renderHook(
			() => useSaveForm({ mode: 'edit', formId: 'form-1' }),
			{ wrapper },
		);

		await act(async () => {
			await result.current.save({ ...baseInput, title: 'Обновлено' });
		});

		expect(pathRef.current).toBe('/forms/new');
	});

	it('выставляет error при сетевой ошибке и не редиректит', async () => {
		mockedHttp.mockRejectedValue(new Error('boom'));

		const { wrapper } = wrapperFactory();
		const { result } = renderHook(() => useSaveForm({ mode: 'create' }), {
			wrapper,
		});

		await act(async () => {
			await result.current.save(baseInput);
		});

		await waitFor(() => {
			expect(result.current.error).not.toBeNull();
		});
		expect(pathRef.current).toBe('/forms/new');
	});
});
