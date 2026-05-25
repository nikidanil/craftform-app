import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';

import { http } from '@/shared/api';
import { useSessionStore } from '@/entities/session';
import { makeTestQueryClient } from '@/test/test-utils';

import { appRoutes } from '../router/router';

vi.mock('@/shared/api', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/shared/api')>();
	return { ...actual, http: vi.fn() };
});
const mockedHttp = vi.mocked(http);

type EmailLookup = Array<Record<string, unknown>>;

/**
 * Маршрутизирует мок http по URL/методу: поиск по email, создание юзера,
 * пустые формы/отклики для главной после входа.
 */
const stubApi = ({
	emailLookup,
	createdUser,
}: {
	emailLookup: EmailLookup;
	createdUser?: Record<string, unknown>;
}) => {
	mockedHttp.mockImplementation(async (url, init) => {
		if (url.includes('/api/users') && url.includes('email=')) {
			return emailLookup;
		}
		if (url.includes('/api/users') && init?.method === 'POST') {
			return createdUser ?? null;
		}
		if (url.includes('/api/forms')) return [];
		if (url.includes('/api/responses')) return [];
		return null;
	});
};

const renderApp = (initialPath: string) => {
	const router = createMemoryRouter(appRoutes, {
		initialEntries: [initialPath],
	});
	render(
		<QueryClientProvider client={makeTestQueryClient()}>
			<RouterProvider router={router} />
		</QueryClientProvider>,
	);
	return router;
};

describe('Сквозной сценарий: аутентификация', () => {
	beforeEach(() => {
		mockedHttp.mockReset();
		useSessionStore.setState({ currentUser: null });
		localStorage.clear();
	});

	it('аноним на защищённом маршруте /me попадает на форму логина', async () => {
		stubApi({ emailLookup: [] });
		const router = renderApp('/me');

		expect(
			await screen.findByRole('button', { name: 'Войти' }),
		).toBeInTheDocument();
		expect(router.state.location.pathname).toBe('/login');
	});

	it('успешный вход переводит на главную и сохраняет пользователя', async () => {
		stubApi({
			emailLookup: [
				{
					id: 'user-1',
					firstName: 'Иван',
					lastName: 'Иванов',
					email: 'ivan@formcraft.dev',
					password: 'password123',
				},
			],
		});
		const router = renderApp('/login');
		const user = userEvent.setup();

		await user.type(screen.getByLabelText('Email'), 'ivan@formcraft.dev');
		await user.type(screen.getByLabelText('Пароль'), 'password123');
		await user.click(screen.getByRole('button', { name: 'Войти' }));

		await waitFor(() => {
			expect(router.state.location.pathname).toBe('/');
			expect(screen.getByRole('button', { name: 'Выход' })).toBeInTheDocument();
		});
		expect(useSessionStore.getState().currentUser?.email).toBe(
			'ivan@formcraft.dev',
		);
	});

	it('регистрация авто-логинит и переводит на главную', async () => {
		stubApi({
			emailLookup: [],
			createdUser: {
				id: 'user-9',
				firstName: 'Пётр',
				lastName: 'Петров',
				email: 'petr@formcraft.dev',
				password: 'password123',
			},
		});
		const router = renderApp('/signup');
		const user = userEvent.setup();

		await user.type(screen.getByLabelText('Имя'), 'Пётр');
		await user.type(screen.getByLabelText('Фамилия'), 'Петров');
		await user.type(screen.getByLabelText('Email'), 'petr@formcraft.dev');
		await user.type(screen.getByLabelText('Пароль'), 'password123');
		await user.type(screen.getByLabelText('Повторите пароль'), 'password123');
		await user.click(
			screen.getByRole('button', { name: 'Зарегистрироваться' }),
		);

		await waitFor(() => expect(router.state.location.pathname).toBe('/'));
		expect(useSessionStore.getState().currentUser?.email).toBe(
			'petr@formcraft.dev',
		);
	});
});
