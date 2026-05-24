import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { http } from '@/shared/api';
import { renderWithProviders } from '@/test/test-utils';
import { useSessionStore } from '@/entities/session';

import { SignupPage } from '../SignupPage';

vi.mock('@/shared/api', () => ({ http: vi.fn() }));
const mockedHttp = vi.mocked(http);

const fillValidFields = async (user: ReturnType<typeof userEvent.setup>) => {
	await user.type(screen.getByLabelText('Имя'), 'Иван');
	await user.type(screen.getByLabelText('Фамилия'), 'Иванов');
	await user.type(screen.getByLabelText('Email'), 'new@formcraft.dev');
	await user.type(screen.getByLabelText('Пароль'), 'password123');
	await user.type(screen.getByLabelText('Повторите пароль'), 'password123');
};

describe('SignupPage', () => {
	beforeEach(() => {
		mockedHttp.mockReset();
		useSessionStore.setState({ currentUser: null });
		localStorage.clear();
	});

	it('успешная регистрация со страницы редиректит на главную', async () => {
		mockedHttp.mockImplementation(async (url, init) => {
			if (url.startsWith('/api/users?email=')) return [];
			if (url === '/api/users' && init?.method === 'POST') {
				return init.body;
			}
			throw new Error(`unexpected ${url}`);
		});

		const { getCurrentPath } = renderWithProviders(<SignupPage />, {
			initialEntries: ['/signup'],
		});

		const user = userEvent.setup();
		await fillValidFields(user);
		await user.click(
			screen.getByRole('button', { name: 'Зарегистрироваться' }),
		);

		await waitFor(() => expect(getCurrentPath()).toBe('/'));
		expect(useSessionStore.getState().currentUser?.email).toBe(
			'new@formcraft.dev',
		);
	});

	it('ссылка «Войти» ведёт на /login', async () => {
		const { getCurrentPath } = renderWithProviders(<SignupPage />, {
			initialEntries: ['/signup'],
		});

		const user = userEvent.setup();
		await user.click(screen.getByRole('link', { name: 'Войти' }));

		await waitFor(() => expect(getCurrentPath()).toBe('/login'));
	});
});
