import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { http } from '@/shared/api';
import { FormBuilderPage } from '../FormBuilderPage';
import type { Form } from '@/entities/form';
import { useSessionStore } from '@/entities/session';

vi.mock('@/shared/api', () => ({ http: vi.fn() }));
const mockedHttp = vi.mocked(http);

const pathRef = { current: '/' };
const LocationSpy = () => {
	const loc = useLocation();
	pathRef.current = loc.pathname;
	return null;
};

const mockForm: Form = {
	id: 'form-1',
	title: 'Обратная связь по курсу',
	description: 'Помогите нам стать лучше',
	createdAt: '2026-04-15T10:00:00.000Z',
	authorId: 'user-1',
	questions: [
		{
			id: 'q-1',
			type: 'short-text',
			body: 'Как вас зовут?',
			required: true,
			order: 0,
		},
	],
};

const buildWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: 0, staleTime: 0 },
			mutations: { retry: false },
		},
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

// DndContext в FormBuilderForm монтирует live region с role="status".
// Для проверки SaveFormStatus используем getByText, а не getByRole('status'),
// иначе будут найдены два элемента и тест упадёт.
describe('FormBuilderPage', () => {
	beforeEach(() => {
		mockedHttp.mockReset();
		pathRef.current = '/forms/form-1/edit';
	});

	it('подгружает форму по id и предзаполняет поля', async () => {
		mockedHttp.mockImplementation(async (url) => {
			if (url === '/api/forms/form-1') return mockForm;
			throw new Error(`unexpected ${url}`);
		});

		const Wrapper = buildWrapper();
		const { rerender } = (await import('@testing-library/react')).render(
			<FormBuilderPage />,
			{ wrapper: Wrapper },
		);
		void rerender;

		await waitFor(() => {
			expect(screen.getByLabelText('Название формы')).toHaveValue(
				'Обратная связь по курсу',
			);
		});
		expect(screen.getByLabelText('Описание формы')).toHaveValue(
			'Помогите нам стать лучше',
		);
	});

	it('«Удалить форму» вызывает delete-цепочку и переходит на /', async () => {
		mockedHttp.mockImplementation(async (url, init) => {
			if (url === '/api/forms/form-1' && !init?.method) return mockForm;
			if (url.startsWith('/api/responses?formId=')) return [];
			if (url === '/api/forms/form-1' && init?.method === 'DELETE')
				return undefined;
			throw new Error(`unexpected ${url}`);
		});

		const Wrapper = buildWrapper();
		const { render } = await import('@testing-library/react');
		render(<FormBuilderPage />, { wrapper: Wrapper });

		await waitFor(() => screen.getByLabelText('Название формы'));

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Удалить форму' }));

		await waitFor(() => expect(pathRef.current).toBe('/'));
	});

	it('сохранение обновлённой формы показывает сообщение успеха', async () => {
		mockedHttp.mockImplementation(async (url, init) => {
			if (url === '/api/forms/form-1' && !init?.method) return mockForm;
			if (url === '/api/forms/form-1' && init?.method === 'PATCH') {
				return {
					...mockForm,
					title: 'Изменено',
				};
			}
			throw new Error(`unexpected ${url} ${init?.method}`);
		});

		const Wrapper = buildWrapper();
		const { render } = await import('@testing-library/react');
		render(<FormBuilderPage />, { wrapper: Wrapper });

		await waitFor(() => screen.getByLabelText('Название формы'));

		const user = userEvent.setup();
		const titleInput = screen.getByLabelText('Название формы');
		await user.clear(titleInput);
		await user.type(titleInput, 'Изменено');
		await user.click(screen.getByRole('button', { name: /сохранить форму/i }));

		await waitFor(() => {
			expect(screen.getByText(/успешно сохранена/i)).toBeInTheDocument();
		});
	});

	it('«Скопировать ссылку» копирует публичный URL формы', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: { writeText },
		});

		mockedHttp.mockImplementation(async (url) => {
			if (url === '/api/forms/form-1') return mockForm;
			throw new Error(`unexpected ${url}`);
		});

		const Wrapper = buildWrapper();
		const { render, fireEvent } = await import('@testing-library/react');
		render(<FormBuilderPage />, { wrapper: Wrapper });

		await waitFor(() => screen.getByLabelText('Название формы'));

		const button = screen.getByRole('button', {
			name: /скопировать ссылку/i,
		});
		await waitFor(() => expect(button).not.toBeDisabled());
		fireEvent.click(button);

		await waitFor(() =>
			expect(writeText).toHaveBeenCalledWith(
				`${window.location.origin}/forms/form-1`,
			),
		);
	});

	it('форма другого автора → молчаливый редирект на /', async () => {
		useSessionStore.setState({
			currentUser: {
				id: 'user-2',
				firstName: 'Мария',
				lastName: 'Петрова',
				email: 'maria@formcraft.dev',
			},
		});
		mockedHttp.mockImplementation(async (url) => {
			if (url === '/api/forms/form-1') return mockForm;
			throw new Error(`unexpected ${url}`);
		});

		const Wrapper = buildWrapper();
		const { render } = await import('@testing-library/react');
		render(<FormBuilderPage />, { wrapper: Wrapper });

		await waitFor(() => expect(pathRef.current).toBe('/'));
		expect(
			screen.queryByLabelText('Название формы'),
		).not.toBeInTheDocument();

		useSessionStore.setState({ currentUser: null });
	});
});
