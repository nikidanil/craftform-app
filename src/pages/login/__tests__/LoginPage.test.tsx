import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { http } from '@/shared/api';
import { renderWithProviders } from '@/test/test-utils';
import { useSessionStore } from '@/entities/session';

import { LoginPage } from '../LoginPage';

vi.mock('@/shared/api', () => ({ http: vi.fn() }));
const mockedHttp = vi.mocked(http);

const seedUser = {
	id: 'user-1',
	firstName: 'Иван',
	lastName: 'Иванов',
	email: 'ivan@formcraft.dev',
	password: 'password123',
};

describe('LoginPage', () => {
	beforeEach(() => {
		mockedHttp.mockReset();
		useSessionStore.setState({ currentUser: null });
		localStorage.clear();
	});

	it('успешный вход со страницы редиректит на главную и сохраняет пользователя', async () => {
		mockedHttp.mockResolvedValueOnce([seedUser]);

		const { getCurrentPath } = renderWithProviders(<LoginPage />, {
			initialEntries: ['/login'],
		});

		const user = userEvent.setup();
		await user.type(screen.getByLabelText('Email'), 'ivan@formcraft.dev');
		await user.type(screen.getByLabelText('Пароль'), 'password123');
		await user.click(screen.getByRole('button', { name: 'Войти' }));

		await waitFor(() => expect(getCurrentPath()).toBe('/'));
		expect(useSessionStore.getState().currentUser?.id).toBe('user-1');
	});

	it('ссылка «Зарегистрироваться» ведёт на /signup', async () => {
		const { getCurrentPath } = renderWithProviders(<LoginPage />, {
			initialEntries: ['/login'],
		});

		const user = userEvent.setup();
		await user.click(
			screen.getByRole('link', { name: 'Зарегистрироваться' }),
		);

		await waitFor(() => expect(getCurrentPath()).toBe('/signup'));
	});
});
